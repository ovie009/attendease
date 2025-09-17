// ./app/(app)/(tabs)/profile.tsx
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import React, { ReactNode, use, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { colors } from '@/utilities/colors';
import { FlashList } from '@shopify/flash-list';
import InterText from '@/components/InterText';
import LinkText from '@/components/LinkText';
import Avatar from '@/components/Avatar';
import { Admin, Department } from '@/types/api';
import handleAdmin from '@/api/handleAdmin';
import { getLoadingData } from '@/utilities/getLoadingData';
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading';
import { HEIGHT } from '@/utilities/dimensions';
import AdminListItem from '@/components/AdminListItem';
import { useAppStore } from '@/stores/useAppStore';
import { Href, useRouter, useSegments } from 'expo-router';
import Skeleton from '@/components/Skeleton';
import { AccountType } from '@/types/general';
import Flex from '@/components/Flex';
import SettingsListItem from '@/components/SettingsListItem';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import LecturerIcon from '@/assets/svg/LecturerIcon.svg';
import handleDepartments from '@/api/handleDepartments';

type AdminListItemProps = Admin & {
    is_loading?: boolean | undefined;
};

type Button = { name: string, href: Href, Icon: ReactNode }

const Profile = () => {

    const {
        displayToast,
    } = useAppStore.getState();

    const router = useRouter();
    const segments = useSegments();

    const user = useAuthStore((state) => state.user);
    // console.log("🚀 ~ Profile ~ user:", user)

    const [admins, setAdmins] = useState<Admin[]>([]);
    const [department, setDepartment] = useState<Department | null>(null);

    const [dataLoading, setDataLoading] = useState<{admins: boolean, departments: boolean}>({
        admins: true,
        departments: true
    });

    useEffect(() => {
        if (user?.account_type === AccountType.Admin) return;
        const fetchDepartment = async () => {
            try {
                const departmentResponse = await handleDepartments.getById(user?.department_id!);
                // console.log("🚀 ~ fetchDepartment ~ departmentResponse:", departmentResponse)

                if (departmentResponse.data) {
                    setDepartment(departmentResponse.data)
                }

                handleDisableDataLoading('departments', setDataLoading)
            } catch (error:any) {
                displayToast('ERROR', error?.message)
            }
        }
        
        fetchDepartment()
    }, [user])
    // console.log("🚀 ~ Profile ~ dataLoading:", dataLoading)

    const buttons = useMemo((): Button[] => {
        if (user?.account_type === AccountType.Admin) {
            return [
                {
                    name: "Change password",
                    href: '/changePassword',
                    Icon: <MaterialIcons name="password" size={20} color={colors.primary} />
                },
            ]
        }

        if (user?.account_type === AccountType.Student) {
            return [
                {
                    name: "Change password",
                    href: '/changePassword',
                    Icon: <MaterialIcons name="password" size={20} color={colors.primary} />
                },
                {
                    name: "Change pin",
                    href: '/changePin',
                    Icon: <FontAwesome5 name="key" size={20} color={colors.primary} />
                },
                {
                    name: "Change card",
                    href: '/changeCard',
                    Icon: <AntDesign name="credit-card" size={20} color={colors.primary} />
                },
                {
                    name: "Get help",
                    href: '/support',
                    Icon: <MaterialIcons name="support-agent" size={20} color={colors.primary} />
                },
            ]
        }

        const buttons: Button[] = [
            {
                name: "Change password",
                href: '/changePassword',
                Icon: <MaterialIcons name="password" size={20} color={colors.primary} />
            },
            {
                name: "Change pin",
                href: '/changePin',
                Icon: <FontAwesome5 name="key" size={20} color={colors.primary} />
            },
            {
                name: "Change card",
                href: '/changeCard',
                Icon: <AntDesign name="credit-card" size={20} color={colors.primary} />
            },
            {
                name: "Authorise student device change",
                href: '/authoriseStudent',
                Icon: <AntDesign name="unlock" size={20} color={colors.primary} />
            },
            {
                name: "Get help",
                href: '/support',
                Icon: <MaterialIcons name="support-agent" size={20} color={colors.primary} />
            },
        ]
        
        if (user?.role === 'Dean' || user?.role === 'HOD') {
            buttons.push({
                name: "View other lecturers in your "+""+ (user?.role === 'Dean' ? "College" : "Department"),
                href: '/lecturers',
                Icon: <LecturerIcon width={20} height={20} />
            })
        }
        
        return buttons;
    }, []);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                if (!user?.is_admin) return;
                const adminsResponse = await handleAdmin.getAll();
                // console.log("🚀 ~ fetchAdmins ~ adminsResponse:", adminsResponse)
                // remove logged in user form list
                setAdmins(adminsResponse.data.filter(item => item.id !== user?.id));
            } catch (error: any) {
                displayToast('ERROR', error?.message)
                // console.error('Error fetching admins:', error);
            } finally {
                handleDisableDataLoading('admins', setDataLoading)
            }
        };
        fetchAdmins();
    }, [segments])

    const adminsData = useMemo<any[]>(() => {
        if (dataLoading.admins) {
            return getLoadingData(['email', 'full_name', 'is_active', 'created_at', 'updated_at'], ['', '', '', '', '']);
        }

        return admins;
    }, [admins, dataLoading.admins]);

    const renderItem = useCallback(({item}: {item: AdminListItemProps}) => (
        <AdminListItem
            isLoading={item?.is_loading}
            fullName={item?.full_name}
            email={item?.email}
            profilePicture={item?.profile_picture}
            onPress={() => {

            }}
        />
    ), [])

    return (
        <View style={styles.container}>
            <FlashList
                data={adminsData}
                keyExtractor={item => item.id}
                // estimatedItemSize={101}
                contentContainerStyle={{
                    paddingTop: 30,
                    paddingBottom: 120,
                    paddingHorizontal: 20,
                }}
                ListHeaderComponent={(
                    <View style={styles.listHeader}>
                        <View style={styles.userContainer}>
                            {user && (
                                <Avatar
                                    name={user?.full_name}
                                    diameter={64}
                                />
                            )}
                            <View style={styles.userDetails}>
                                <InterText
                                    color={colors.black}
                                    fontSize={15}
                                    lineHeight={18}
                                    fontWeight={'medium'}
                                >
                                    {user?.full_name}
                                </InterText>
                                <InterText
                                    color={colors.subtext}
                                    fontSize={12}
                                    lineHeight={14}
                                >
                                    {user?.email}
                                </InterText>
                                {user?.account_type === AccountType.Student && (
                                    <InterText
                                        fontSize={12}
                                        lineHeight={14}
                                        color={colors.subtext}
                                    >
                                        {user?.level} level
                                    </InterText>
                                )}
                                {dataLoading.departments && (
                                    <ActivityIndicator color={colors.primary} />
                                )}
                                {!dataLoading.departments && department && (
                                    <InterText
                                        fontSize={12}
                                        lineHeight={14}
                                        color={colors.subtext}
                                    >
                                        {department?.department_name}
                                    </InterText>
                                )}
                            </View>
                        </View>
                        <Flex>
                            {buttons.map((button) => (
                                <SettingsListItem
                                    key={button?.name}
                                    {...button}
                                />
                            ))}
                        </Flex>
                        {user?.account_type === AccountType.Admin && (dataLoading.admins) && (
                            <View style={styles.adminHeaderBar}>
                                <Skeleton
                                    height={19}
                                    borderRadius={2.5}
                                    width={75}
                                />
                                <Skeleton
                                    height={19}
                                    borderRadius={2.5}
                                    width={100}
                                />
                            </View>
                        )}
                        {user?.account_type === AccountType.Admin && (
                            <React.Fragment>
                                {(!dataLoading.admins && adminsData.length !== 0) ? (
                                    <View style={styles.adminHeaderBar}>
                                        <InterText
                                            fontWeight={500}
                                        >
                                            Other Admins:
                                        </InterText>
                                        <LinkText
                                            onPress={() => {
                                                router.push('/(root)/(app)/(admin)/AddAdmin')
                                            }}
                                        >
                                            Add admin
                                        </LinkText>
                                    </View>
                                ) : (
                                    <LinkText
                                        fontSize={16}
                                        lineHeight={19}
                                        onPress={() => {
                                            router.push('/(root)/(app)/(admin)/AddAdmin')
                                        }}
                                    >
                                        + Add admin
                                    </LinkText>
                                )}
                            </React.Fragment>
                        )}
                    </View>
                )}
                renderItem={renderItem}
            />
        </View>
    );
}

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    listHeader: {
        marginBottom: 24,
        display: 'flex',
        gap: 20,
    },
    userContainer: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 18,
        flexDirection: 'row',
    },
    userDetails: {
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
    },
    adminHeaderBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    noData: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: HEIGHT/4
    },
    footer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 100,
        // height: HEIGHT/4
    },
    logoutButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        flexDirection: 'row',
    }
});