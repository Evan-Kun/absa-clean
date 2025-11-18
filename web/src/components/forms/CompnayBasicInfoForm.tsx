import { useEffect, useState } from 'react';
import '../common.scss';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, useTheme } from "@mui/material";
import { useSnackbar } from '../../context/SnackbarContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import organizationProfileServices from '../../services/api-services/orgazation-api.service';

const CompnayBasicInfoForm = (props: any) => {
    const { companyDetail, handleCloseModal } = props;
    const { updateOrganizationsDetails } = organizationProfileServices();
    const theme = useTheme();
    const showSnackbar = useSnackbar();
    const [loader, setLoader] = useState<boolean>(false);

    // Form validation schema
    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required').max(255, 'Name must be at most 255 characters long'),
        contactEmail: Yup.string().required('Contact email is required').max(255, 'Contact email must be at most 255 characters long'),
        description: Yup.string().required('Description is required').max(1024, 'Description must be at most 1024 characters long')
    });

    // Formik hook
    const formik = useFormik({
        initialValues: {
            name: companyDetail?.organizationName || '',
            contactEmail: companyDetail?.contactEmail || '',
            description: companyDetail?.description || '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setLoader(true);

            const payload = {
                name: values?.name,
                contactEmail: values?.contactEmail,
                description: values?.description,
            }
            const resUpdate = await updateOrganizationsDetails(companyDetail?.id, payload);
            if (resUpdate?.success) {
                showSnackbar(resUpdate?.message, 'success');
                handleCloseModal && handleCloseModal(resUpdate?.data)
            } else {
                showSnackbar(resUpdate?.data?.message || 'An error occurred', 'error');
            }
            setLoader(false);
        }
    });

    const buttonSx = {
        ...(loader && {
            bgcolor: theme.palette.primary.main,
        }),
    };

    return (
        <>
            <Dialog
                open={true}
                scroll={'paper'}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Company Profile</DialogTitle>
                <DialogContent dividers={true}>
                    <DialogContentText tabIndex={-1}>
                        <div className="row mb-3">
                            <div className="col-6">
                                <TextField
                                    required
                                    className="w-100"
                                    id="name"
                                    name="name"
                                    label="Name"
                                    color="primary"
                                    variant="outlined"
                                    placeholder="Enter name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && String(formik.errors.name || '')}
                                    sx={{ marginBottom: { xs: 2, md: 0 } }}
                                />
                            </div>
                            <div className="col-6">
                                <TextField
                                    required
                                    className="w-100"
                                    id="contactEmail"
                                    name="contactEmail"
                                    label="Contact Email"
                                    color="primary"
                                    variant="outlined"
                                    placeholder="Enter Contact Email"
                                    value={formik.values.contactEmail}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.contactEmail && Boolean(formik.errors.contactEmail)}
                                    helperText={formik.touched.contactEmail && String(formik.errors.contactEmail || '')}
                                    sx={{ marginBottom: { xs: 2, md: 0 } }}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <TextField
                                    multiline
                                    required
                                    rows={6}
                                    className="w-100"
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
                                    helperText={formik?.touched?.description && String(formik?.errors?.description || '')}
                                    sx={{ marginBottom: { xs: 2, md: 0 } }}
                                />
                            </div>
                        </div>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button disabled={loader} onClick={() => handleCloseModal()} variant="outlined" color="primary">Close</Button>
                    <Box sx={{ m: 1, position: 'relative' }}>
                        <Button variant="contained" sx={buttonSx} disabled={loader || !formik.isValid || formik.isSubmitting} onClick={() => formik.submitForm()}>
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
        </>
    );
};

export default CompnayBasicInfoForm;
