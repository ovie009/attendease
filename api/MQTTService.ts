import * as Paho from 'paho-mqtt';
import * as Device from 'expo-device';

// Generate a unique client ID
// Generate a unique client ID with a random component to avoid duplicates
const uniqueRandomId = Math.random().toString(36).substring(2, 10);
const clientId = `${Device.brand || 'unknown'}_${Device.modelName || 'model'}_${uniqueRandomId}`;

// --- Configuration ---
const MQTT_HOST = '61b1e2e8dfea48c4a578d2b9e73006d3.s1.eu.hivemq.cloud';
const MQTT_PORT = 8884; // WSS port
const MQTT_USERNAME = 'attendease';
const CONNECT_TIMEOUT = 30; // 30 seconds
const KEEP_ALIVE_INTERVAL = 30; // 30 seconds (reduced from 60)
// --- End Configuration ---

// --- Reconnection Configuration ---
const INITIAL_RECONNECT_DELAY = 2000; // 2 seconds
const MAX_RECONNECT_DELAY = 60000;    // 60 seconds
const RECONNECT_BACKOFF_MULTIPLIER = 2;
// --- End Reconnection Configuration ---

class MQTTService {
    public client: Paho.Client | null = null;
    public connected: boolean = false;
    private ackCallbacks: Record<string, (payload: string) => void> = {};
    private messageCallback?: (message: string, topic: string) => void;
    private initialTopics: string[] = [];
    private reconnectCount: number = 0;
    private reconnectTimer?: NodeJS.Timeout;
    private reconnectDelay: number = INITIAL_RECONNECT_DELAY;
    private manualDisconnect: boolean = false;

    constructor() {
        // No initialization needed here
    }

    /**
     * Connects to the MQTT broker and subscribes to specified topics.
     * Returns a Promise that resolves on successful connection, rejects on failure.
     * @param topics - An array of topic strings to subscribe to upon connection.
     */
    public connect(topics: string[]): Promise<void> {
        // Clear any existing reconnect timers
        this.clearReconnectTimer();
        
        // Reset manual disconnect flag when connect is called
        this.manualDisconnect = false;
        
        // Store topics for reconnection
        this.initialTopics = [...topics];

        return new Promise((resolve, reject) => {
            const mqttPassword = process.env.EXPO_PUBLIC_MQTT;

            console.log(`[MQTT] Attempting connect. Password loaded: ${mqttPassword ? 'Yes' : 'NO (undefined/empty!)'}`);

            if (!mqttPassword) {
                const errorMsg = "[MQTT] Connection Failed: MQTT Password (EXPO_PUBLIC_MQTT) is not set in environment variables.";
                console.error(errorMsg);
                reject(new Error(errorMsg));
                return;
            }

            // Prevent multiple connection attempts if already connected
            if (this.client && (this.connected || this.client.isConnected())) {
                console.warn('[MQTT] Connect called but already connected or connecting.');
                resolve(); // Already connected
                return;
            }

            // Disconnect previous instance if exists but not connected
            if (this.client && !this.connected) {
                console.log('[MQTT] Cleaning up previous non-connected client instance before new connection attempt.');
                try {
                    this.client.disconnect();
                } catch (e) {
                    // Ignore errors during cleanup
                }
                this.client = null;
                this.connected = false;
            }

            try {
                console.log(`[MQTT] Creating Paho client for ${MQTT_HOST}:${MQTT_PORT} with ClientID: ${clientId}`);
                this.client = new Paho.Client(MQTT_HOST, Number(MQTT_PORT), clientId);

                // Assign handlers BEFORE connecting
                this.client.onConnectionLost = this.onConnectionLost;
                this.client.onMessageArrived = this.onMessageArrived;

                const connectOptions: Paho.ConnectionOptions = {
                    userName: MQTT_USERNAME,
                    password: mqttPassword,
                    timeout: CONNECT_TIMEOUT,
                    keepAliveInterval: KEEP_ALIVE_INTERVAL, // Reduced keep-alive interval
                    cleanSession: true,
                    useSSL: true, // Required for WSS
                    reconnect: false, // Handle reconnection manually
                    onSuccess: () => {
                        console.log('[MQTT] Connection successful!');
                        this.connected = true;
                        // Reset reconnect counter on successful connection
                        this.reconnectCount = 0;
                        this.reconnectDelay = INITIAL_RECONNECT_DELAY;
                        
                        // IMPORTANT: Delay subscriptions slightly to ensure connection is fully established
                        setTimeout(() => {
                            if (this.client && this.connected) {
                                console.log('[MQTT] Subscribing to initial topics:', topics);
                                topics.forEach(topic => this.subscribe(topic));
                            } else {
                                console.warn('[MQTT] Cannot subscribe: connection lost during subscription delay');
                            }
                        }, 500); // 500ms delay before subscribing
                        
                        resolve(); // Resolve the promise on success
                    },
                    onFailure: (error: { errorCode: number; errorMessage: string }) => {
                        const errorMsg = `[MQTT] Connection failed: ${error.errorMessage} (Code: ${error.errorCode})`;
                        console.error(errorMsg);
                        this.connected = false;
                        this.client = null;
                        
                        // Schedule reconnection unless it was a manual disconnect
                        // if (!this.manualDisconnect) {
                        //     this.scheduleReconnect();
                        // }
                        
                        reject(new Error(errorMsg));
                    },
                };

                console.log('[MQTT] Calling client.connect()...');
                this.client.connect(connectOptions);

            } catch (error: any) {
                console.error("[MQTT] Error initializing Paho client or initiating connection:", error);
                this.client = null;
                this.connected = false;
                
                // Schedule reconnection unless it was a manual disconnect
                if (!this.manualDisconnect) {
                    this.scheduleReconnect();
                }
                
                reject(error);
            }
        });
    }

    private onConnectionLost = (responseObject: { errorCode: number; errorMessage: string }): void => {
        this.connected = false;
        
        if (responseObject.errorCode !== 0) {
            console.error(`[MQTT] Connection lost: ${responseObject.errorMessage} (Code: ${responseObject.errorCode})`);
            
            // Check for specific error conditions
            if (responseObject.errorMessage.includes('Socket closed') || 
                responseObject.errorCode === 8) {
                console.log('[MQTT] Socket closed. This could be due to network issues or duplicate client IDs');
            }
            
            // Only attempt to reconnect if this wasn't a manual disconnect
            if (!this.manualDisconnect) {
                // Add a small random delay to avoid thundering herd problem with multiple clients
                const jitter = Math.floor(Math.random() * 1000); // 0-1000ms random jitter
                setTimeout(() => this.scheduleReconnect(), jitter);
            } else {
                console.log('[MQTT] Not reconnecting due to manual disconnect request');
            }
        } else {
            console.log('[MQTT] Connection closed gracefully.');
        }
        
        // Clean up resources but retain the client reference until we're sure it's fully cleaned up
        // This prevents race conditions where onConnectionLost fires but connect callbacks are still pending
        const oldClient = this.client;
        this.client = null;
        this.ackCallbacks = {};
        
        // Give any in-flight operations a chance to complete
        setTimeout(() => {
            try {
                if (oldClient) {
                    // Attempt to force-close any lingering connection
                    oldClient.disconnect();
                }
            } catch (e) {
                // Ignore errors during cleanup
            }
        }, 100);
    };

    private scheduleReconnect(): void {
        // Clear any existing reconnect timer
        this.clearReconnectTimer();
        
        console.log(`[MQTT] Scheduling reconnection in ${this.reconnectDelay}ms (attempt #${this.reconnectCount + 1})`);
        
        this.reconnectTimer = setTimeout(() => {
            console.log(`[MQTT] Attempting reconnection (#${this.reconnectCount + 1})...`);
            
            this.reconnectCount++;
            
            // Attempt to reconnect with the initial topics
            this.connect(this.initialTopics)
                .then(() => {
                    console.log('[MQTT] Reconnection successful');
                    
                    // If a message callback was set before, re-apply it
                    if (this.messageCallback) {
                        this.setMessageCallback(this.messageCallback);
                    }
                })
                .catch(err => {
                    console.error("[MQTT] Reconnection failed:", err);
                    
                    // Increase backoff delay for next attempt (with maximum limit)
                    this.reconnectDelay = Math.min(
                        this.reconnectDelay * RECONNECT_BACKOFF_MULTIPLIER,
                        MAX_RECONNECT_DELAY
                    );
                });
        }, this.reconnectDelay);
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
    }

    private onMessageArrived = (message: Paho.Message): void => {
        const topic = message.destinationName;
        const payloadString: string = message.payloadString;

        if (this.ackCallbacks[topic]) {
            try {
                this.ackCallbacks[topic](payloadString);
            } catch (error) {
                console.error(`[MQTT] Error in ack callback for ${topic}:`, error);
            } finally {
                delete this.ackCallbacks[topic];
            }
            return;
        }

        if (this.messageCallback) {
            try {
                this.messageCallback(payloadString, topic);
            } catch (error) {
                console.error(`[MQTT] Error in custom message callback for ${topic}:`, error);
            }
        } else {
            console.warn(`[MQTT] Message received on topic ${topic}, but no custom callback set.`);
        }
    };

    public subscribe(topic: string, qos: Paho.Qos = 0): void {
        if (!this.client) {
            console.warn(`[MQTT] Cannot subscribe: Client is null. Topic: ${topic}`);
            return;
        }
        
        if (!this.connected || !this.client.isConnected()) {
            console.warn(`[MQTT] Cannot subscribe: Client not connected. Topic: ${topic}`);
            // Store topic for later subscription once connected
            if (!this.initialTopics.includes(topic)) {
                this.initialTopics.push(topic);
                console.log(`[MQTT] Added ${topic} to pending subscriptions`);
            }
            return;
        }
        
        try {
            console.log(`[MQTT] Subscribing to topic: ${topic} with QoS: ${qos}`);
            this.client.subscribe(topic, {
                qos,
                onSuccess: () => console.log(`[MQTT] Successfully subscribed to ${topic}`),
                onFailure: (err) => console.error(`[MQTT] Failed to subscribe to ${topic}:`, err)
             });
        } catch (error) {
            console.error(`[MQTT] Error calling subscribe for topic ${topic}:`, error);
        }
    }

    public unsubscribe(topic: string): void {
        if (this.client && this.connected) {
            try {
                console.log(`[MQTT] Unsubscribing from topic: ${topic}`);
                this.client.unsubscribe(topic, {
                     onSuccess: () => console.log(`[MQTT] Successfully unsubscribed from ${topic}`),
                     onFailure: (err) => console.error(`[MQTT] Failed to unsubscribe from ${topic}:`, err)
                });
            } catch (error) {
                console.error(`[MQTT] Error calling unsubscribe for topic ${topic}:`, error);
            }
        } else {
            console.warn(`[MQTT] Cannot unsubscribe: Client not connected. Topic: ${topic}`);
        }
    }

    public setMessageCallback(callback: ((message: string, topic: string) => void) | undefined | null): void {
        console.log(`[MQTT] Setting message callback: ${callback ? 'Function' : 'None'}`);
        this.messageCallback = callback || undefined;
    }

    public publish(topic: string, payload: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client || !this.connected) {
                const errorMsg = '[MQTT] Cannot publish: Client not connected.';
                console.error(errorMsg);
                reject(new Error(errorMsg));
                return;
            }

            if (typeof payload !== 'string') {
                const errorMsg = '[MQTT] Cannot publish: Payload must be a string.';
                console.error(errorMsg, payload);
                reject(new Error(errorMsg));
                return;
            }

            try {
                const message = new Paho.Message(payload);
                message.destinationName = topic;
                message.qos = 1;

                this.client.send(message);
                resolve(); // Resolve when send is initiated

            } catch (error) {
                console.error(`[MQTT] Failed to initiate send message to ${topic}:`, error);
                reject(error);
            }
        });
    }

    public disconnect(): void {
        console.log('[MQTT] Disconnect requested.');
        
        // Set flag to prevent auto-reconnection
        this.manualDisconnect = true;
        
        // Clear any pending reconnect attempts
        this.clearReconnectTimer();
        
        if (this.client) {
            if (this.connected) {
                try {
                    console.log('[MQTT] Calling client.disconnect()...');
                    this.client.disconnect();
                    // onConnectionLost will handle state update
                } catch (error) {
                    console.error('[MQTT] Error during client.disconnect() call:', error);
                    // Force state update if disconnect throws
                    this.connected = false;
                    this.client = null;
                    this.ackCallbacks = {};
                }
            } else {
                console.warn('[MQTT] Disconnect requested but client was not connected.');
                // Ensure cleanup even if not connected
                this.client = null;
                this.connected = false;
                this.ackCallbacks = {};
            }
        } else {
            console.log('[MQTT] Disconnect requested but client was not initialized.');
            this.connected = false;
        }
    }
    
    /**
     * Check if the client is currently connected
     * @returns boolean indicating connection status
     */
    public isConnected(): boolean {
        return this.connected && this.client !== null && this.client.isConnected();
    }
    
    /**
     * Force an immediate reconnection attempt if not connected
     * @returns Promise that resolves when connected or rejects if connection fails
     */
    public reconnect(): Promise<void> {
        if (this.isConnected()) {
            console.log('[MQTT] Reconnect called but already connected');
            return Promise.resolve();
        }
        
        // Clear any scheduled reconnection
        this.clearReconnectTimer();
        
        // Reset manual disconnect flag
        this.manualDisconnect = false;
        
        console.log('[MQTT] Forcing immediate reconnection...');
        return this.connect(this.initialTopics);
    }
}

export default new MQTTService();