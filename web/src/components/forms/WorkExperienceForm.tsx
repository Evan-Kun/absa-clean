import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, useTheme } from "@mui/material";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { FormikTouched, useFormik } from "formik";
import { useSnackbar } from "../../context/SnackbarContext";
import userProfileServices from "../../services/api-services/user-profile-api.service";
import { useUser } from "../../context/UserContext";

const WorkExperienceForm = (props: any) => {
    const theme = useTheme();
    const { updateProfileBasicDetails } = userProfileServices();
    const { editRecordData, handleCloseModal,profileUserId } = props;
    const currentYear = new Date()?.getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const [loader, setLoader] = useState(false);
    const showSnackbar = useSnackbar();
    const { user } = useUser();

    const validationSchema = Yup.object({
        jobTitle: Yup.string().required("Job title is required").max(255, 'Job title must be at most 255 characters long'),
        companyName: Yup.string().required("Company name is required").max(255, 'Company Name must be at most 255 characters long'),
        description: Yup.array().of(Yup.string().required("At least 1 description point is required").max(2024, 'Description point must be at most 2024 characters long'))
        // .min(3, "You must provide at least 3 description points"),
    });

    const formik = useFormik({
        initialValues: {
            id: editRecordData?.id || null,
            jobTitle: editRecordData?.jobTitle || '',
            companyName: editRecordData?.companyName || '',
            joiningMonth: editRecordData?.joiningMonth || '',
            joiningYear: editRecordData?.joiningYear || '',
            isCurrentlyWorking: editRecordData?.isCurrentlyWorking || false,
            toMonth: editRecordData?.toMonth || '',
            toYear: editRecordData?.toYear || '',
            description: editRecordData?.description || [''],
        },
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setLoader(true);
            let payload: any = values;
            if (user?.isSuperadmin || user?.isOrgadmin) { payload['userId'] = profileUserId }
            const resUpdateUser = await updateProfileBasicDetails(values, 'workexperience');
            if (resUpdateUser?.success) {
                showSnackbar(resUpdateUser?.message, 'success');
                handleCloseModal && handleCloseModal('work-experience');
            } else {
                showSnackbar(resUpdateUser?.data?.message || 'An error occurred', 'error');
            }
            setLoader(false);
        },
    });

    // Adding and removing description points
    const addDescription = () => formik.setFieldValue('description', [...formik.values.description, '']);
    const removeDescription = (index: any) => {
        const updatedDescription = formik.values.description.filter((_: any, i: any) => i !== index);
        formik.setFieldValue('description', updatedDescription);
    };

    const buttonSx = {
        ...(loader && {
            bgcolor: theme.palette.primary.main,
        }),
    };

    return (
        <Dialog open={true} scroll="paper" maxWidth="md" fullWidth>
            <DialogTitle>Work Experience</DialogTitle>
            <DialogContent dividers>
                <DialogContentText tabIndex={-1}>
                    <div className='row mb-3'>
                        <div className="col-md-6">
                            <TextField
                                required
                                fullWidth
                                id="jobTitle"
                                name="jobTitle"
                                label="Job Title"
                                color="secondary"
                                variant="outlined"
                                value={formik.values.jobTitle}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.jobTitle && Boolean(formik.errors.jobTitle)}
                                helperText={formik.touched.jobTitle && String(formik.errors.jobTitle || '')}
                            />
                        </div>
                        <div className="col-md-6">
                            <TextField
                                required
                                fullWidth
                                id="companyName"
                                name="companyName"
                                label="Company Name"
                                color="secondary"
                                variant="outlined"
                                value={formik.values.companyName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.companyName && Boolean(formik.errors.companyName)}
                                helperText={formik.touched.companyName && String(formik.errors.companyName || '')}
                            />
                        </div>
                    </div>

                    {/* Joining Date & Current Working Checkbox */}
                    <div className='row mb-3'>
                        <div className="col-md-6">
                            <div className="row mb-3">
                                <div className="col-md-4  mb-2">
                                    <FormControl fullWidth>
                                        <InputLabel variant="outlined" id="join-month">Join Month</InputLabel>
                                        <Select
                                            labelId="join-month-select-label"
                                            label="Join Month"
                                            name="joiningMonth"
                                            id="join-month-select"
                                            value={formik.values.joiningMonth}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.joiningMonth && Boolean(formik.errors.joiningMonth)}
                                        >
                                            {monthNames.map((month, i) => (
                                                <MenuItem key={i} value={month}>{month}</MenuItem>
                                            ))}
                                        </Select>
                                        {formik.touched.joiningMonth && formik.errors.joiningMonth && (
                                            <p style={{ color: theme.palette.error.main, fontSize: '12px' }}>{String(formik.errors.joiningMonth || '')}</p>
                                        )}
                                    </FormControl>
                                </div>
                                <div className="col-md-4  mb-2">
                                    <FormControl fullWidth>
                                        <InputLabel>Join Year</InputLabel>
                                        <Select
                                            name="joiningYear"
                                            label="Join Year"
                                            value={formik.values.joiningYear}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.joiningYear && Boolean(formik.errors.joiningYear)}
                                        >
                                            {Array.from({ length: 50 }, (_, i) => currentYear - i).map(year => (
                                                <MenuItem key={year} value={year}>{year}</MenuItem>
                                            ))}
                                        </Select>
                                        {formik.touched.joiningYear && formik.errors.joiningYear && (
                                            <p style={{ color: theme.palette.error.main, fontSize: '12px' }}>{String(formik.errors.joiningYear || '')}</p>
                                        )}
                                    </FormControl>
                                </div>
                                <div className="col-md-4 ">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="isCurrentlyWorking"
                                                checked={formik.values.isCurrentlyWorking}
                                                onChange={formik.handleChange}
                                            />
                                        }
                                        label="Currently working here"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* To Month and Year (when not currently working) */}
                        {!formik.values.isCurrentlyWorking && (
                            <div className="col-md-6">
                                <div className='row mb-3'>
                                    <div className="col-md-6  mb-2">
                                        <FormControl fullWidth>
                                            <InputLabel>To Month</InputLabel>
                                            <Select
                                                name="toMonth"
                                                label="To Month"
                                                value={formik.values.toMonth}
                                                onChange={formik.handleChange}
                                            >
                                                {monthNames.map((month, i) => (
                                                    <MenuItem key={i} value={month}>{month}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="col-md-6  mb-2">
                                        <FormControl fullWidth>
                                            <InputLabel>To Year</InputLabel>
                                            <Select
                                                name="toYear"
                                                label="To Year"
                                                value={formik.values.toYear}
                                                onChange={formik.handleChange}
                                            >
                                                {Array.from({ length: 50 }, (_, i) => currentYear - i).map(year => (
                                                    <MenuItem key={year} value={year}>{year}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>



                    {/* Description Points */}
                    <label>Job Points:</label>
                    {formik.values?.description?.length < 1 && (
                        <p style={{ color: theme.palette.error.main, fontSize: '12px' }}>You must provide at least 1 description points</p>
                    )}

                    {formik.values?.description?.map((desc: string, index: number) => (
                        <div key={index} className="row mb-3">
                            <div className="col-md-10">
                                <TextField
                                    fullWidth
                                    name={`description.${index}`}
                                    color="secondary"
                                    variant="outlined"
                                    placeholder={`Enter point ${index + 1}...`}
                                    value={desc}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        Boolean(
                                            (formik.touched.description as FormikTouched<string>[] | undefined)?.[index] &&
                                            (formik.errors.description as string[] | undefined)?.[index]
                                        )
                                    }
                                    helperText={
                                            (formik.touched.description as FormikTouched<string>[] | undefined)?.[index] &&
                                            (formik.errors.description as string[] | undefined)?.[index] ?
                                            (formik.errors.description as string[])[index] : undefined
                                    }
                                />

                            </div>
                            <div className="col-md-2 d-flex align-items-center gap-2">
                                <Tooltip title="Delete Point" arrow>
                                    <Button
                                        onClick={() => removeDescription(index)}
                                        disabled={formik.values.description.length === 1}
                                        variant="contained"
                                        color="error"
                                        sx={{
                                            minWidth: 0,
                                            padding: '8px',
                                            borderRadius: '50%',
                                        }}
                                    >
                                        <DeleteSweepIcon />
                                    </Button>
                                </Tooltip>
                                {formik.values.description.length === index + 1 && (
                                    <Tooltip title="Add More Point" arrow>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={addDescription}
                                            sx={{
                                                minWidth: 0,
                                                padding: '8px',
                                                borderRadius: '50%',
                                            }}
                                        >
                                            <AddOutlinedIcon />
                                        </Button>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    ))}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleCloseModal()} variant="outlined" color="primary" disabled={loader}>Close</Button>

                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button color="primary" variant="contained" sx={buttonSx} disabled={loader || !formik.isValid || formik.isSubmitting} onClick={() => formik.handleSubmit()}>
                        Save
                    </Button>
                    {loader && (
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

            </DialogActions>
        </Dialog>
    );
};

export default WorkExperienceForm;
