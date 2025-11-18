import { Autocomplete, Box, Button, Drawer, FormControl, InputLabel, List, ListItem, MenuItem, Select, TextField } from "@mui/material"
import { useEffect, useState } from "react"
import { useUser } from "../../context/UserContext"

const FilterCriteriaDrawer = (props: any) => {
    const { user, skillsList } = useUser();
    const { organizations, filterFormValues, onSearch, onClose, displayFilterOption } = props;
    const [expandFilterOptions, setExpandFilterOptions] = useState<any>({
        basic_details: false,
        organization: false,
        skills: false
    })
    const [displayFilterGroup, setDisplayFilterGroup] = useState<any>({
        basic_details: true,
        organization: true,
        skills: true
    })
    let defaultValues = {
        firstName: "",
        lastName: "",
        bio: "",
        organization_id: [],
        location: "",
        skillName: []
    }
    const [formValues, setFormValues] = useState<any>(defaultValues);

    useEffect(() => {
        const { firstName, lastName, bio, location, organization_id, skillName } = filterFormValues;
        if (firstName || lastName || bio || location) { setExpandFilterOptions((option: any) => ({ ...option, basic_details: true })) }
        if (organization_id.length > 0) { setExpandFilterOptions((option: any) => ({ ...option, organization: true })) }
        if (skillName.length > 0) { setExpandFilterOptions((option: any) => ({ ...option, skills: true })) }
        setFormValues(filterFormValues)
    }, [filterFormValues])

    useEffect(() => {
        if (displayFilterOption) {
            setDisplayFilterGroup((pre: any) => ({ ...pre, ...displayFilterOption }))
        }        
    }, [displayFilterOption])

    const handleChange = (e: any) => {
        const { name, value } = e.target
        setFormValues({ ...formValues, [name]: value })
    }

    const autoHandleChange = (e: any, value: any) => {
        setFormValues({ ...formValues, skillName: value })
    }

    return (<>
        <Drawer anchor="right" open={true} PaperProps={{
            sx: {
                width: '500px',
                maxWidth: '100%',
            },
        }}>
            <Box>
                <List className="pt-0">
                    <ListItem className="d-flex backgroud-secondary align-items" style={{ height: '65px' }}>
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M440-160q-17 0-28.5-11.5T400-200v-240L168-736q-15-20-4.5-42t36.5-22h560q26 0 36.5 22t-4.5 42L560-440v240q0 17-11.5 28.5T520-160h-80Zm40-308 198-252H282l198 252Zm0 0Z" /></svg>
                        </span>
                        <h4 className="text-white mb-0 fw-normal">Filters</h4>
                    </ListItem>
                </List>
                {displayFilterGroup?.basic_details && <>
                    <List>
                        <ListItem className="d-flex justify-content-between">
                            <h5>Basic Details </h5>
                            <span onClick={() => setExpandFilterOptions((option: any) => ({ ...option, basic_details: !option.basic_details }))}>
                                {expandFilterOptions?.basic_details ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M180.78-427v-106h598.44v106H180.78Z" /></svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M417-417H166v-126h251v-251h126v251h251v126H543v251H417v-251Z" /></svg>
                                }
                            </span>
                        </ListItem>
                        {expandFilterOptions?.basic_details && (<>
                            <ListItem>
                                <div className="d-flex gap-2 w-100">
                                    <TextField className="w-50" id="firstName"
                                        name="firstName"
                                        label="First name"
                                        value={formValues?.firstName}
                                        onChange={handleChange}
                                    />
                                    <TextField className="w-50" id="lastName"
                                        name="lastName"
                                        label="Last name"
                                        value={formValues?.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </ListItem>
                            <ListItem>
                                <TextField className='w-100' id="bio"
                                    name="bio"
                                    label="Bio"
                                    value={formValues?.bio}
                                    onChange={handleChange}
                                />
                            </ListItem>
                            {/* <ListItem>
                                <TextField className='w-100' id="location"
                                    name="location"
                                    label="Location"
                                    value={formValues?.location}
                                    onChange={handleChange}
                                />
                            </ListItem> */}
                        </>)}
                    </List>
                    <hr style={{ margin: '5px 0' }} /></>}

                {displayFilterGroup?.organization && <>
                    <List>
                        <ListItem className="d-flex justify-content-between">
                            <h5>Organization </h5>
                            <span onClick={() => setExpandFilterOptions((option: any) => ({ ...option, organization: !option.organization }))}>
                                {expandFilterOptions?.organization ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M180.78-427v-106h598.44v106H180.78Z" /></svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M417-417H166v-126h251v-251h126v251h251v126H543v251H417v-251Z" /></svg>
                                }
                            </span>
                        </ListItem>
                        {expandFilterOptions?.organization && (<>
                            <ListItem>
                                <div className="w-100">
                                    <FormControl fullWidth>
                                        <InputLabel variant="outlined" id="organization">Organization</InputLabel>
                                        <Select
                                            disabled={user?.isOrgadmin ? true : false}
                                            label="Organization"
                                            name="organization_id"
                                            multiple
                                            value={formValues?.organization_id}
                                            onChange={handleChange}
                                        >
                                            {organizations?.map((ele: any) => (
                                                <MenuItem value={ele?.id}>{ele?.organizationName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </ListItem>
                        </>)}
                    </List>
                    <hr style={{ margin: '5px 0' }} />
                </>}
                {displayFilterGroup?.skills && <>
                    <List>
                        <ListItem className="d-flex justify-content-between">
                            <h5>Skills </h5>
                            <span onClick={() => setExpandFilterOptions((option: any) => ({ ...option, skills: !option.skills }))}>
                                {expandFilterOptions?.skills ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M180.78-427v-106h598.44v106H180.78Z" /></svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M417-417H166v-126h251v-251h126v251h251v126H543v251H417v-251Z" /></svg>
                                }
                            </span>
                        </ListItem>
                        {expandFilterOptions?.skills && (<>
                            <ListItem>
                                <div className="w-100" >
                                    <FormControl fullWidth>
                                        <Autocomplete
                                            className='w-100'
                                            options={skillsList}
                                            multiple
                                            value={formValues?.skillName}
                                            onChange={autoHandleChange}
                                            renderInput={(params) => <TextField {...params} label="Skills" name='skillName' />}
                                        />
                                    </FormControl>
                                </div>
                            </ListItem>
                        </>)}
                    </List>
                    <hr style={{ margin: '5px 0' }} /></>}
                <List>
                    <ListItem className="d-flex justify-content-between">
                        <div>
                            <Button color='secondary' variant="contained" onClick={() => onClose()}>Close</Button>
                            <Button className="m-1" color='secondary' variant="outlined" onClick={() => onSearch(defaultValues)}>Clear</Button>
                        </div>
                        <div>
                            <Button color='primary' variant="contained" onClick={() => onSearch(formValues)}>Search</Button>
                        </div>
                    </ListItem>
                </List>
            </Box>
        </Drawer >
    </>)
}


export default FilterCriteriaDrawer