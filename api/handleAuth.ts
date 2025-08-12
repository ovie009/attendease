import { AuthResponse, EmailOtpType, Session, SignUpWithPasswordCredentials, User, UserResponse } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase"
import { Response } from "@/types/api";

interface authParams {
    email: string, 
    password: string
    data?: object,
}

const signup = async ({email, password, data}: authParams): Promise<{
    isSuccessful: boolean,
    message: string,
    data: {user: User | null, session: Session | null},
}> => {
    try {
        const response: AuthResponse = await supabase.auth.signUp({
            email,
            password,
            options: {
                data
            }
        });

        if (response.error) {
            throw response.error;
        }

        return {
            isSuccessful: true,
            message: "signup successful",
            data: response.data,
        }
    } catch (error) {
        throw error;
    }
}

const updateUser = async ({email, user_metadata}: {email: string, user_metadata: object}): Promise<{
    isSuccessful: boolean,
    message: string,
    data: any,
}> => {
    try {
        const {
            data,
            error
        } = await supabase.auth.updateUser({
            email,
            data: user_metadata,
        });

        if (error) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "signup successful",
            data,
        }
    } catch (error) {
        throw error;
    }
}

interface verifyOTPParams {
    email: string,
    otp: string,
    type: EmailOtpType,
}

interface response {
    isSuccessful: boolean,
    message: string,
    data: any
}

const verifyOTP = async ({email, otp, type}: verifyOTPParams): Promise<response> => {
    try {
        const {
            data,
            error
        } = await supabase.auth.verifyOtp({ 
            email, 
            token: otp, 
            type 
        });

        if (error) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "signup successful",
            data,
        }
    } catch (error) {
        throw error;  
    }
}

const resendVerificationOTP = async (): Promise<response> => {
    try {
        // Resend verification email
        const { error, data } = await supabase.auth.reauthenticate();
        
        if (error) {
            throw error;
        }
        
        return {
            isSuccessful: true,
            message: "Verification email resent successfully",
            data,
        };
    } catch (error) {
        throw error;
    }
}


const login = async ({email, password}: authParams): Promise<response> => {
    try {
        const {
            data,
            error
        } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.log('login error', error)
            throw error;
        }

        return {
            isSuccessful: true,
            message: "login successful",
            data,
        }
        
    } catch (error) {
        throw error;
    }
}


const signout = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
    } catch (error) {
        throw error;
    }
}

const signupTeamMember = async (email: string) => {
    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL}/functions/v1/signup_team_member`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ email }),
        });
    
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
        
        // data : {"app_metadata": {"provider": "email", "providers": ["email"]}, "aud": "authenticated", "created_at": "2024-12-20T14:32:30.139663Z", "email": "markanthony@yopmail.com", "id": "00442005-6658-44bf-a71d-13f7f4c242a2", "identities": [{"created_at": "2024-12-20T14:32:30.141937Z", "email": "markanthony@yopmail.com", "id": "00442005-6658-44bf-a71d-13f7f4c242a2", "identity_data": [Object], "identity_id": "764b996b-0fa1-4cf8-9899-08e053e108d6", "last_sign_in_at": "2024-12-20T14:32:30.141875131Z", "provider": "email", "updated_at": "2024-12-20T14:32:30.141937Z", "user_id": "00442005-6658-44bf-a71d-13f7f4c242a2"}], "is_anonymous": false, "phone": "", "role": "authenticated", "updated_at": "2024-12-20T14:32:30.14472Z", "user_metadata": {}}
        return data;
    } catch (error) {
        // console.log('Error in signupTeamMember function:', error);
        throw error; // Handle the error as needed
    }
}

export type ChangePasswordPayload = {
    current_password: string,
    new_password: string,
    retype_new_password: string,
    email: string,
}

const changePassword = async ({current_password, new_password, retype_new_password, email}: ChangePasswordPayload): Promise<Response<User>> => {
    try {

        // Input validation
        if (!retype_new_password || !new_password) {
            throw new Error("New password and retype password are required");
        }

        // new password must not match old password
        if (current_password && current_password === new_password) {
            throw new Error("New password cannot be the same as the current password");
        }

        // new password and retype password must match
        if (retype_new_password !== new_password) {
            throw new Error("New password and retype password do not match");
        }

        // Update password using Supabase auth API
        const { data, error } = await supabase.auth.updateUser({
            password: new_password,
            email,
        });

        if (error) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Password updated successfully",
            data: data.user,
        };
    } catch (error) {
        throw error;
    }
};

export default {
    signup,
    login,
    signout,
    verifyOTP,
    updateUser,
    changePassword,
    signupTeamMember,
    resendVerificationOTP,
}