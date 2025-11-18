import './home.scss'
import { useContext, useEffect, useRef, useState } from 'react';
import Cardview from './Cardview';
import SummaryList from '../summaryList/Summarylist';
import FilterCriteriaDrawer from './FilterCriteriaDrawer';
import { Autocomplete, Badge, Box, Button, CircularProgress, FormControl, IconButton, TextField, Tooltip, useTheme } from '@mui/material';
import userProfileServices from '../../services/api-services/user-profile-api.service'
import { useSnackbar } from '../../context/SnackbarContext';
import { useUser } from '../../context/UserContext';
import { LoadingContext } from '../../App';
// import '../../components/common.scss';
import { useParams } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

const formValues = {
    firstName: "",
    lastName: "",
    bio: "",
    organization_id: [],
    location: "",
    skillName: [],
    organizationsName: []
}

const Home = (props: any) => {
    const { companyDetail, displayFilterOption } = props;
    const theme = useTheme();
    const { id } = useParams<{ id: any }>();
    const { loading, setLoading } = useContext(LoadingContext);
    const { fetchUserProfileList } = userProfileServices()
    const showSnackbar = useSnackbar();

    const [view, setView] = useState('cardView');
    const { isLoggedOut, user, organizationsList, skillsList = [] } = useUser();
    const [profiles, setProfiles] = useState<any>([])
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 100;
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [isActiveFilter, setIsActiveFilter] = useState<boolean>(false);
    const [filterFormValues, setFilterFormValues] = useState<any>({
        ...formValues,
        organization_id: (id || companyDetail?.id) ? [id || companyDetail?.id] : [],

    })
    const debounceRef = useRef<any>(null);


    useEffect(() => {
        const { firstName, lastName, bio, location, skillName, organization_id } = filterFormValues;
        if (firstName || lastName || bio || location || skillName?.length > 0 || organization_id?.length > 0) {
            setIsActiveFilter(true)
        } else {
            setIsActiveFilter(false)
        }
    }, [filterFormValues])

    useEffect(() => {
        getUserProfileActiveList(filterFormValues);
    }, [id, currentPage, user])


    useEffect(() => {
        if (typeof isLoggedOut !== 'undefined' && isLoggedOut) {
            if (currentPage == 1) {
                getUserProfileActiveList(filterFormValues)
            } else {
                setCurrentPage(1)
            }
            // if (currentPage != 1) { return setCurrentPage(1) }
            // if (currentPage == 1) { getUserProfileActiveList(filterFormValues) }
        }
    }, [isLoggedOut])


    const loadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const onSearch = (formValues: any) => {
        if ((id || companyDetail?.id) && !formValues?.organization_id?.includes(id || companyDetail?.id)) { formValues?.organization_id.push(id || companyDetail?.id) }
        setDrawerOpen(false)
        setFilterFormValues(formValues)
        if (currentPage > 1) return setCurrentPage(1)
        getUserProfileActiveList(formValues)
    }

    const debouncedSearch = (updatedFilters: any, delay: number = 800) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            onSearch(updatedFilters);
        }, delay);
    };

    const getUserProfileActiveList = async (formValues: any) => {
        try {
            setLoading(true);
            const playload = { "filterCriteria": { ...formValues } }

            const resProfiles = await fetchUserProfileList(currentPage, itemsPerPage, playload)

            if (resProfiles?.data?.length > 0) {
                currentPage === 1 ? setProfiles(resProfiles?.data) : setProfiles((pre: any) => ([...pre, ...resProfiles?.data]))
                setHasMore(currentPage < resProfiles?.pagination?.totalPages);
            }
            else {
                setProfiles([])
            }
            setLoading(false);

        }
        catch (error: any) {
            setProfiles([]);
            setLoading(false);
            showSnackbar(error?.message || 'An error occurred while getting profiles list', 'error');
        }
    }


    const buttonSx = {
        ...(loading && {
            bgcolor: theme.palette.primary.main,
        }),
    }

    const autoHandleChange = (e: any, value: any) => {
        const updatedFilters = { ...filterFormValues, skillName: value };
        setFilterFormValues(updatedFilters);
        debouncedSearch(updatedFilters);
    };

    const handleRemoveFilter = (key: string, value?: string) => {
        setFilterFormValues((prev: any) => {
            const updatedFilters = Array.isArray(prev[key])
                ? { ...prev, [key]: prev[key]?.filter((item: any) => item !== value) }
                : { ...prev, [key]: '' };

            debouncedSearch(updatedFilters);
            return updatedFilters;
        });
    };

    const resetFilters = () => {
        setFilterFormValues(formValues)
        debouncedSearch(formValues);
    }


    return (
        <>
            <div className='mt-4 mb-1'>
                <div className="w-50" >
                    <FormControl fullWidth >
                        <Autocomplete
                            className='w-100'
                            multiple
                            options={skillsList}
                            value={filterFormValues?.skillName}
                            onChange={autoHandleChange}
                            renderInput={(params) => (
                                <TextField {...params} label="Search by keyword" name="search" />
                            )}
                        />
                    </FormControl>
                </div>
                <div className="mb-3 skill-tag-wrapper">
                    <div className='d-flex align-items-center flex-wrap'>
                        {[...Object.entries(filterFormValues)?.flatMap(([key, value]) => {
                            // If value string
                            if (typeof value === "string" && value.trim() !== "") {
                                return [{
                                    key,
                                    label: `${key?.toLowerCase()}: ${value}`,
                                    onRemove: () => handleRemoveFilter(key),
                                }];
                            }

                            // for orfanaization filer for display org Name
                            if (!companyDetail && key === "organization_id" && Array.isArray(value)) {
                                return value.map((orgId: string) => {
                                    const matchedOrg = organizationsList?.find((org: any) => org?.id === orgId);
                                    if (!matchedOrg) return null;
                                    return {
                                        key: orgId,
                                        label: `Org: ${matchedOrg.organizationName}`,
                                        onRemove: () => handleRemoveFilter(key, orgId),
                                    };
                                }).filter(Boolean);
                            }

                            return [];
                        })
                        ]?.map((item: any) => (
                            <div
                                key={item.key}
                                className="rounded-pill tags d-flex align-items-center px-2 py-1 bg-light text-muted me-2 mb-1"
                            >
                                <label className="me-1 text-capitalize">{item.label}</label>
                                <IconButton size="small" onClick={item.onRemove}>
                                    <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </div>
                        ))}

                        {/* If value found in object than display else not*/}
                        {Object.entries(filterFormValues)?.some(([key, value]) =>
                            !companyDetail && key !== 'skillName' && (Array.isArray(value) && value?.length > 0) || (typeof value === 'string' && value?.trim() !== '')
                        ) && (
                                <label className='text-primary cursor-pointer' onClick={() => resetFilters()} >
                                    Clear filters
                                </label>
                            )}
                    </div>
                </div>
            </div>


            <div className='d-flex justify-content-end gap-1 text-muted'>
                {profiles?.length > 0 && (<>
                    {view == 'summaryList' && (
                        <Tooltip title="Card View" arrow>
                            <div className='cursor-pointer' onClick={() => setView('cardView')}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#6c757d "><path d="M120-520v-320h320v320H120Zm0 400v-320h320v320H120Zm400-400v-320h320v320H520Zm0 400v-320h320v320H520ZM200-600h160v-160H200v160Zm400 0h160v-160H600v160Zm0 400h160v-160H600v160Zm-400 0h160v-160H200v160Zm400-400Zm0 240Zm-240 0Zm0-240Z" /></svg>
                            </div>
                        </Tooltip>
                    )}
                    {!companyDetail && view == 'cardView' && (<>
                        <Tooltip title="List View" arrow>
                            <div className='cursor-pointer' onClick={() => setView('summaryList')}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6c757d "><path d="M120-200v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Z" /></svg>
                            </div>
                        </Tooltip>
                        <span className='border'></span>
                    </>)}
                </>)}

                <Tooltip title="Filter" arrow>

                    <div className='cursor-pointer' onClick={() => setDrawerOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M440-160q-17 0-28.5-11.5T400-200v-240L168-736q-15-20-4.5-42t36.5-22h560q26 0 36.5 22t-4.5 42L560-440v240q0 17-11.5 28.5T520-160h-80Zm40-308 198-252H282l198 252Zm0 0Z" /></svg>

                        {isActiveFilter && (<Badge color="primary" variant="dot" style={{ position: 'relative', top: '-8px', right: '4px' }}></Badge>)}
                    </div>

                </Tooltip>
            </div>
            {drawerOpen && (
                <FilterCriteriaDrawer
                    filterFormValues={filterFormValues}
                    onSearch={onSearch}
                    organizations={organizationsList}
                    onClose={() => setDrawerOpen(false)}
                    displayFilterOption={displayFilterOption}
                />)}

            {profiles?.length > 0 ? (<>

                {view == 'cardView' && (<Cardview profiles={profiles} />)}
                {view == 'summaryList' && (<SummaryList profiles={profiles} />)}

                <div className='d-flex justify-content-center mt-2 mb-5'>
                    {hasMore && (
                        <Box sx={{ m: 1, position: 'relative' }}>
                            <Button color='primary' variant="contained" sx={buttonSx} disabled={loading} onClick={() => loadMore()}>
                                Load More Profiles
                            </Button>
                            {loading && (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: theme.palette.primary.main,
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-12px',
                                        marginLeft: '-12px',
                                    }}
                                />
                            )}
                        </Box>
                    )}
                </div>
            </>
            ) : <>
                <p className="text-muted">{loading ? 'Fetching profiles...' : 'No profiles found to display.'}</p>
            </>
            }
        </>
    )
}
export default Home
