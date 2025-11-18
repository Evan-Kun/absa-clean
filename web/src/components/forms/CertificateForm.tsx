import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, useTheme } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from '../../context/SnackbarContext';
import { useUser } from '../../context/UserContext';
import userProfileServices from '../../services/api-services/user-profile-api.service';
import { useState } from 'react';


const CertificateForm = (props: any) => {
    const { editRecordData, handleCloseModal, profileUserId } = props;
    const { updateProfileBasicDetails } = userProfileServices();
    const { user } = useUser();
    const theme = useTheme();
    const showSnackbar = useSnackbar();
    const currentYear = new Date()?.getFullYear();
    const [loader, setLoader] = useState<boolean>(false);


    // Form validation schema with Yup
    const validationSchema = Yup.object({
        title: Yup.string().required('Title is required').max(255, 'Title must be at most 255 characters long'),
        url: Yup.string().required('URL is required').max(255, 'URL must be at most 255 characters long'),
        issuedYear: Yup.string().required('Issued Year is required'),
        expiredOn: Yup.number(),
    });


    // Formik hook for form handling and validation
    const formik = useFormik({
        initialValues: {
            id: editRecordData?.id || null,
            title: editRecordData?.title || '',
            url: editRecordData?.url || '',
            issuedYear: editRecordData?.issuedYear || '',
            expiredOn: editRecordData?.expiredOn || '',
        },
        validationSchema,
        enableReinitialize: true, // Reinitialize form if editRecordData changes
        onSubmit: async (values) => {
            let payload: any = values;
            if (user?.isSuperadmin || user?.isOrgadmin) { payload['userId'] = profileUserId }
            setLoader(true);
            const resUpdateUser = await updateProfileBasicDetails(payload, 'certificate');
            if (resUpdateUser?.success) {
                showSnackbar(resUpdateUser?.message, 'success');
                handleCloseModal && handleCloseModal('work-experience');
            } else {
                showSnackbar(resUpdateUser?.data?.message || 'An error occurred', 'error');
            }
            setLoader(false);
        },
    });



    return (<>
        <Dialog open={true} onClose={handleCloseModal} scroll={'paper'} maxWidth="md" fullWidth>
            <DialogTitle>Certificate</DialogTitle>

            <DialogContent dividers>
                <DialogContentText tabIndex={-1}>
                    {/* Row 1 */}
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <TextField
                                className="w-100"
                                required
                                id="title"
                                name="title"
                                label="Title"
                                color="primary"
                                variant="outlined"
                                placeholder="Enter title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && String(formik.errors.title || '')}
                                sx={{ marginBottom: { xs: 2, md: 0 } }}
                            />
                        </div>
                        <div className="col-md-6">
                            <TextField
                                className="w-100"
                                required
                                id="url"
                                name="url"
                                label="Url"
                                color="primary"
                                variant="outlined"
                                placeholder="Enter url"
                                value={formik.values.url}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.url && Boolean(formik.errors.url)}
                                helperText={formik.touched.url && String(formik.errors.url || '')}
                                sx={{ marginBottom: { xs: 2, md: 0 } }}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <FormControl fullWidth>
                                <InputLabel variant="outlined" id="issuedYear">
                                    Issued Year *
                                </InputLabel>
                                <Select
                                    required
                                    variant="outlined"
                                    labelId="issuedYear-select-label"
                                    id="issuedYear-select"
                                    label="Issued Year"
                                    name="issuedYear"
                                    value={formik.values.issuedYear || ''}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.issuedYear && Boolean(formik.errors.issuedYear)}
                                >
                                    {Array.from({ length: 50 }, (_, i) => currentYear - i).map((year, index) => (
                                        <MenuItem key={index} value={year}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.issuedYear && formik.errors.issuedYear && (
                                    <p style={{ color: theme.palette.error.main, fontSize: '12px' }}>{String(formik.errors.issuedYear || '')}</p>
                                )}
                            </FormControl>
                        </div>

                        <div className="col-md-6">
                            <FormControl fullWidth>
                                <InputLabel variant="outlined" id="expiredOn">
                                    Expired On
                                </InputLabel>
                                <Select
                                    variant="outlined"
                                    labelId="expiredOn-select-label"
                                    id="expiredOn-select"
                                    label="Expired On"
                                    name="expiredOn"
                                    value={formik.values.expiredOn || ''}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.expiredOn && Boolean(formik.errors.expiredOn)}
                                >
                                    {Array.from({ length: 50 }, (_, i) => currentYear - i + 5).map((year, index) => (
                                        <MenuItem key={index} value={year}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.expiredOn && formik.errors.expiredOn && (
                                    <p style={{ color: theme.palette.error.main, fontSize: '12px' }}>{String(formik.errors.expiredOn || '')}</p>
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
        </Dialog >

    </>)

}

export default CertificateForm