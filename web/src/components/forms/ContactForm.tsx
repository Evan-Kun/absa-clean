import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, useTheme } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from '../../context/SnackbarContext';
import { useState } from 'react';
import organizationProfileServices from '../../services/api-services/orgazation-api.service';
import { useUser } from '../../context/UserContext';


const ContactForm = (props: any) => {
    const { user } = useUser();
    const { handleCloseModal, profile_Details } = props;
    const { contactOrganization } = organizationProfileServices();
    const theme = useTheme();
    const showSnackbar = useSnackbar();
    const [loader, setLoader] = useState<boolean>(false);


    // Form validation schema with Yup
    const validationSchema = Yup.object({
        description: Yup.string().required('Description is required').max(1024, 'Description must be at most 1024 characters long'),
        requestedBy: Yup.string().required('Email is required').max(400, 'Email must be at most 400 characters long'),
    });

    const formik = useFormik({
        initialValues: {
            description: profile_Details?.user?.organization?.emailTemplate?.description ?? '',
            requestedBy: user?.email ?? ''
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            let payload: any = values;
            payload['userID'] = profile_Details?.user?.id

            setLoader(true);
            const resUpdateUser = await contactOrganization(profile_Details?.user?.organization.id, payload);
            if (resUpdateUser?.success) {
                showSnackbar(resUpdateUser?.message, 'success');
                handleCloseModal && handleCloseModal();
            } else {
                showSnackbar(resUpdateUser?.data?.message || 'An error occurred', 'error');
            }
            setLoader(false);
        },
    });

    const buttonSx = {
        ...(loader && {
            bgcolor: theme.palette.primary.main
        }),
    };

    return (<>
        <Dialog open={true} onClose={handleCloseModal} scroll={'paper'} maxWidth="md" fullWidth>
            <DialogTitle>Contact Now</DialogTitle>

            <DialogContent dividers>
                <DialogContentText tabIndex={-1}>
                    <div className="col-md-6 mb-3">
                        <h6 className="text-primary mb-2">Profile Information</h6>
                        <div className="p-3 border rounded bg-light">
                            <p className="mb-1"><strong>Name:</strong> {profile_Details?.firstName} {profile_Details?.lastName}</p>
                            <p className="mb-1"><strong>Job Title:</strong> {profile_Details?.jobTitle} </p>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6 mb-3">
                            <h6 className="text-primary mb-2">Send To</h6>
                            <div className="p-3 border rounded bg-light">
                                <p className="mb-1"> {profile_Details?.user?.organization?.contactEmail} </p>
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <h6 className="text-primary mb-2">Request By</h6>
                            <TextField
                                className="w-100"
                                required
                                id="requestedBy"
                                name="requestedBy"
                                color="primary"
                                variant="outlined"
                                placeholder="Enter your email"
                                value={formik.values.requestedBy}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.requestedBy && Boolean(formik.errors.requestedBy)}
                                helperText={formik.touched.requestedBy && String(formik.errors.requestedBy || '')}
                                sx={{ marginBottom: { xs: 2, md: 0 } }}
                            />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <TextField
                                className="w-100"
                                required
                                multiline
                                rows={6}
                                id="description"
                                name="description"
                                label="Description"
                                color="primary"
                                variant="outlined"
                                placeholder="Enter description"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && String(formik.errors.description || '')}
                                sx={{ marginBottom: { xs: 2, md: 0 } }}
                            />
                        </div>
                    </div>

                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleCloseModal()} disabled={loader} variant="outlined" color="primary">
                    Close
                </Button>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button variant="contained" sx={buttonSx} disabled={loader || !formik.isValid || formik.isSubmitting} onClick={() => formik.submitForm()}>
                        Send Mail
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
        </Dialog >
    </>)

}

export default ContactForm