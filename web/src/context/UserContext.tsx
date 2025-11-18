import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import userProfileServices from '../services/api-services/user-profile-api.service';
import commonApiServices from '../services/api-services/common-api.service';

interface UserContextType {
    user: any | null;
    setUser: React.Dispatch<React.SetStateAction<any | null>>;
    getUserDetails: () => Promise<void>;

    isLoggedOut: any | null;
    setIsLoggedOut: React.Dispatch<React.SetStateAction<any | null>>;

    skillsList: any | null;
    setSkillsList: React.Dispatch<React.SetStateAction<any | null>>;
    getAllSkills: () => Promise<void>;

    organizationsList: any | null;
    setOrganizationsList: React.Dispatch<React.SetStateAction<any | null>>;
    getOrganizations: () => Promise<void>;

}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const { fetchUserDetails, fetchOrganizations } = userProfileServices();
    const { fetchAllSkills, fetchSettings } = commonApiServices();
    const [isLoggedOut, setIsLoggedOut] = useState<any>(false);
    const [user, setUser] = useState<any | null>(null);
    const [skillsList, setSkillsList] = useState<any | null>([]);
    const [organizationsList, setOrganizationsList] = useState<any | null>([]);

    const getUserDetails = async () => {
        const res = await fetchUserDetails();
        if (res?.success) {
            const objUser = res?.data?.data || {};
            objUser["isSuperadmin"] = objUser?.role?.roleName == 'superadmin'
            objUser["isOrgadmin"] = objUser?.role?.roleName == 'orgadmin'

            const objResSetting = await fetchSettings();
            objUser["settings"] = objResSetting?.data?.data ?? null;

            setUser(objUser);
        } else {
            setUser(null);
        }
    };

    const getAllSkills = async () => {
        const res = await fetchAllSkills();
        if (res?.success && res?.data?.length > 0) {
            const formateData = res?.data?.map((i: any) => i?.name) || [];
            const uniqueOptions = [...new Set(formateData)]
            setSkillsList(uniqueOptions);
        } else {
            setSkillsList([]);
        }
    };

    const getOrganizations = async () => {
        const resOrgazation = await fetchOrganizations();
        if (resOrgazation?.success && resOrgazation?.data?.length > 0) {
            setOrganizationsList(resOrgazation?.data);
        } else {
            setOrganizationsList([]);
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                getUserDetails,
                isLoggedOut,
                setIsLoggedOut,
                skillsList,
                setSkillsList,
                getAllSkills,
                organizationsList,
                setOrganizationsList,
                getOrganizations
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
