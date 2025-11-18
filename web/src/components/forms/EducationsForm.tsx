import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, useTheme } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from '../../context/SnackbarContext';
import userProfileServices from '../../services/api-services/user-profile-api.service';
import { useUser } from '../../context/UserContext';

const EducationsForm = (props: any) => {
    const { updateProfileBasicDetails } = userProfileServices();
    const theme = useTheme();
    const { user } = useUser();
    const currentYear = new Date()?.getFullYear();
    const showSnackbar = useSnackbar();
    const { editRecordData, handleCloseModal, profileUserId } = props;
    const [loader, setLoader] = useState<boolean>(false);

    // Form validation schema with Yup
    const validationSchema = Yup.object({
        degreeName: Yup.string().required('Degree is required').max(255, 'Degree Name must be at most 255 characters long'),
        instituteName: Yup.string().required('Institute Name is required').max(255, 'Institute Name must be at most 255 characters long'),
        location: Yup.string().required('Location is required'),
        startYear: Yup.number().required('Start Year is required'),
        endYear: Yup.number()
            .required('End Year is required')
            .min(Yup.ref('startYear'), 'End Year must be greater than or equal to Start Year'),
    });

    // Formik hook for form handling and validation
    const formik = useFormik({
        initialValues: {
            id: editRecordData?.id || null,
            degreeName: editRecordData?.degreeName || '',
            instituteName: editRecordData?.instituteName || '', 
            location: editRecordData?.location || '',
            startYear: editRecordData?.startYear || '',
            endYear: editRecordData?.endYear || '',
        },
        validationSchema,
        enableReinitialize: true, // Reinitialize form if editRecordData changes
        onSubmit: async (values) => {
            let payload:any = values;
            if (user?.isSuperadmin || user?.isOrgadmin) { payload['userId'] = profileUserId }
            setLoader(true);
            const resUpdateUser = await updateProfileBasicDetails(payload, 'education');
            if (resUpdateUser?.success) {
                showSnackbar(resUpdateUser?.message, 'success');
                handleCloseModal && handleCloseModal('work-experience');
            } else {
                showSnackbar(resUpdateUser?.data?.message || 'An error occurred', 'error');
            }
            setLoader(false);
        },
    });

    return (
        <Dialog open={true} onClose={handleCloseModal} scroll={'paper'} maxWidth="md" fullWidth>
            <DialogTitle>Education</DialogTitle>

            <DialogContent dividers>
                <DialogContentText tabIndex={-1}>
                    {/* Row 1 */}
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <TextField
                                className="w-100"
                                required
                                id="degreeName"
                                name="degreeName"
                                label="Degree"
                                color="primary"
                                variant="outlined"
                                placeholder="Enter degree"
                                value={formik.values.degreeName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.degreeName && Boolean(formik.errors.degreeName)}
                                helperText={formik.touched.degreeName && String(formik.errors.degreeName || '')}
                                sx={{ marginBottom: { xs: 2, md: 0 } }}
                            />
                        </div>
                        <div className="col-md-6">
                            <TextField
                                className="w-100"
                                required
                                id="instituteName"
                                name="instituteName"
                                label="Institute Name"
                                color="primary"
                                variant="outlined"
                                placeholder="Enter institute name"
                                value={formik.values.instituteName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.instituteName && Boolean(formik.errors.instituteName)}
                                helperText={formik.touched.instituteName && String(formik.errors.instituteName || '')}
                                sx={{ marginBottom: { xs: 2, md: 0 } }}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <TextField
                                required
                                className="w-100"
                                id="location"
                                name="location"
                                label="Location"
                                color="primary"
                                variant="outlined"
                                placeholder="Enter location"
                                value={formik.values.location}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.location && Boolean(formik.errors.location)}
                                helperText={formik.touched.location && String(formik.errors.location || '')}
                                sx={{ marginBottom: { xs: 2, md: 0 } }}
                            />
                        </div>

                        <div className="col-md-4">
                            <FormControl fullWidth>
                                <InputLabel variant="outlined" id="startYear">
                                    Start Year *
                                </InputLabel>
                                <Select
                                    required
                                    variant="outlined"
                                    labelId="startYear-select-label"
                                    id="startYear-select"
                                    label="Start Year"
                                    name="startYear"
                                    value={formik.values.startYear || ''}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.startYear && Boolean(formik.errors.startYear)}
                                >
                                    {Array.from({ length: 50 }, (_, i) => currentYear - i).map((year, index) => (
                                        <MenuItem key={index} value={year}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.startYear && formik.errors.startYear && (
                                    <p style={{ color: theme.palette.error.main, fontSize: '12px' }}>{String(formik.errors.startYear || '')}</p>
                                )}
                            </FormControl>
                        </div>

                        <div className="col-md-4">
                            <FormControl fullWidth>
                                <InputLabel variant="outlined" id="endYear">
                                    End Year *
                                </InputLabel>
                                <Select
                                    required
                                    variant="outlined"
                                    labelId="endYear-select-label"
                                    id="endYear-select"
                                    label="End Year"
                                    name="endYear"
                                    value={formik.values.endYear || ''}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.endYear && Boolean(formik.errors.endYear)}
                                >
                                    {Array.from({ length: 50 }, (_, i) => currentYear - i + 5).map((year, index) => (
                                        <MenuItem key={index} value={year}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.endYear && formik.errors.endYear && (
                                    <p style={{ color: theme.palette.error.main, fontSize: '12px' }}>{String(formik.errors.endYear || '')}</p>
                                )}
                            </FormControl>
                        </div>
                    </div>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleCloseModal()} variant="outlined" color="primary">
                    Close
                </Button>
                <Button
                    onClick={() => formik.submitForm()}
                    variant="contained"
                    color="primary"
                    disabled={formik.isSubmitting || !formik.isValid}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EducationsForm;
