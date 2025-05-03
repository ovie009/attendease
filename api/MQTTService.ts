import * as Paho from 'paho-mqtt';
import * as Device from 'expo-device';

// Generate a unique client ID
const clientId = `${Device.brand || 'unknown'}_${Device.modelName || 'model'}_${Device.osBuildId || 'build'}_${Date.now()}`;

// --- Configuration ---
// Check HiveMQ Cloud Console for YOUR specific WSS host and port
const MQTT_HOST = '61b1e2e8dfea48c4a578d2b9e73006d3.s1.eu.hivemq.cloud';
const MQTT_PORT = 8884; // <--- LIKELY CHANGE: Use the WSS port (usually 8884)
const MQTT_USERNAME = 'attendease';
// --- End Configuration ---

class MQTTService {
    public client: Paho.Client | null = null;
    public connected: boolean = false;
    private ackCallbacks: Record<string, (payload: string) => void> = {};
    private messageCallback?: (message: string, topic: string) => void;
    private initialTopics: string[] = ['attendease/register', 'attendease/session', 'attendease/attendance']; // Store topics for potential reconnect

    constructor() {
        // No initialization needed here now
    }

    /**
     * Connects to the MQTT broker and subscribes to specified topics.
     * Returns a Promise that resolves on successful connection, rejects on failure.
     * @param topics - An array of topic strings to subscribe to upon connection.
     */
    public connect(topics: string[]): Promise<void> {
        // Store topics for potential use later (e.g., reconnect)
        this.initialTopics = topics;

        return new Promise((resolve, reject) => {
            const mqttPassword = process.env.EXPO_PUBLIC_MQTT;

            // Log the environment variable being used
            console.log(`[MQTT] Attempting connect. Password loaded: ${mqttPassword ? 'Yes' : 'NO (undefined/empty!)'}`);

            if (!mqttPassword) {
                const errorMsg = "[MQTT] Connection Failed: MQTT Password (EXPO_PUBLIC_MQTT) is not set in environment variables.";
                console.error(errorMsg);
                reject(new Error(errorMsg));
                return;
            }

            // Prevent multiple connection attempts if already connected or connecting
            if (this.client && (this.connected || this.client.isConnected())) {
                 console.warn('[MQTT] Connect called but already connected or connecting.');
                 // If already connected, maybe just ensure subscriptions?
                 // topics.forEach(topic => this.subscribe(topic));
                 resolve(); // Indicate success as it's already connected
                 return;
            }

             // Disconnect previous instance if exists but not connected
            if (this.client && !this.connected) {
                 console.log('[MQTT] Cleaning up previous non-connected client instance before new connection attempt.');
                 try {
                     // Attempt graceful disconnect, but don't wait or rely on it heavily here
                     this.client.disconnect();
                 } catch (e) {
                     // Ignore errors during cleanup
                 }
                 this.client = null;
                 this.connected = false;
            }


            try {
                console.log(`[MQTT] Creating Paho client for ${MQTT_HOST}:${MQTT_PORT} with ClientID: ${clientId}`);
                // Ensure port is a number
                this.client = new Paho.Client(MQTT_HOST, Number(MQTT_PORT), clientId);

                // Assign handlers BEFORE connecting
                this.client.onConnectionLost = this.onConnectionLost;
                this.client.onMessageArrived = this.onMessageArrived;

                const connectOptions: Paho.ConnectionOptions = {
                    userName: MQTT_USERNAME,
                    password: mqttPassword,
                    timeout: 30, // Increased timeout slightly
                    keepAliveInterval: 60, // Standard keep-alive
                    cleanSession: true,
                    useSSL: true, // Explicitly true for WSS (port 8884 implies this, but good practice)
                    reconnect: false, // Disable Paho's built-in reconnect, handle manually if needed in onConnectionLost
                    onSuccess: () => {
                        console.log('[MQTT] Connection successful!');
                        this.connected = true;
                        // Subscribe to initial topics
                        console.log('[MQTT] Subscribing to initial topics:', topics);
                        topics.forEach(topic => this.subscribe(topic));
                        resolve(); // Resolve the promise on success
                    },
                    onFailure: (error: { errorCode: number; errorMessage: string }) => {
                        // console.error(`[MQTT] Connection Failed: ${error.errorMessage} (Code: ${error.errorCode})`);
                        // this.connected = false;
                        // // this.client = null; // Clear client on failure
                        // reject(new Error(`MQTT Connection Failed: ${error.errorMessage}`)); // Reject the promise on failure
                    },
                };

                console.log('[MQTT] Calling client.connect()...');
                this.client.connect(connectOptions);

            } catch (error: any) {
                console.error("[MQTT] Error initializing Paho client or initiating connection:", error);
                this.client = null;
                this.connected = false;
                reject(error); // Reject promise on synchronous errors
            }
        });
    }

    private onConnectionLost = (responseObject: { errorCode: number; errorMessage: string }): void => {
        this.connected = false;
        if (responseObject.errorCode !== 0) {
            console.error(`[MQTT] Connection lost: ${responseObject.errorMessage} (Code: ${responseObject.errorCode})`);
            // --- Optional: Implement Reconnection Logic ---
            // Consider exponential backoff
            // console.log('[MQTT] Attempting reconnect in 5 seconds...');
            // setTimeout(() => {
            //     if (!this.connected) { // Check again before reconnecting
            //          console.log('[MQTT] Reconnecting...');
            //          this.connect(this.initialTopics) // Use stored topics
            //              .catch(err => console.error("[MQTT] Reconnect failed:", err));
            //     }
            // }, 5000);
            // --- End Reconnection Logic ---

        } else {
             console.log('[MQTT] Connection closed gracefully.');
        }
         // It's often better to nullify the client on *any* disconnect
         // if you expect connect() to always create a new one.
         this.client = null;
         // Clear callbacks related to the lost connection
         this.ackCallbacks = {};
         // Optionally clear the message callback too, or let the app reset it after reconnect
         // this.messageCallback = undefined;
    };

    private onMessageArrived = (message: Paho.Message): void => {
        const topic = message.destinationName;
        const payloadString: string = message.payloadString;
        // console.log(`[MQTT] Message Arrived - Topic: ${topic}, Payload: ${payloadString.substring(0, 100)}...`); // Log truncated payload


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
        if (this.client && this.connected) {
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
        } else {
            console.warn(`[MQTT] Cannot subscribe: Client not connected. Topic: ${topic}`);
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
         // Publishing logic remains largely the same, added logging
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

                // console.log(`[MQTT] Publishing to ${topic} (QoS 1): ${payload.substring(0,100)}...`);
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
        if (this.client) {
            if (this.connected) {
                try {
                    // Unsubscribe all topics before disconnecting? Maybe not necessary with cleanSession=true
                    // this.initialTopics.forEach(topic => this.unsubscribe(topic));
                    // this.unsubscribe('#'); // If you explicitly subscribed to #

                    console.log('[MQTT] Calling client.disconnect()...');
                    this.client.disconnect();
                    // onConnectionLost will handle state update (connected=false, client=null)
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
            this.connected = false; // Ensure state is correct
        }
    }
}

export default new MQTTService();