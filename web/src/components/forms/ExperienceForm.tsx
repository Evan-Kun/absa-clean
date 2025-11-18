import { useEffect, useState } from 'react';
import '../common.scss';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, useTheme } from "@mui/material";
import { useSnackbar } from '../../context/SnackbarContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import userProfileServices from '../../services/api-services/user-profile-api.service';
import { useUser } from '../../context/UserContext';

const ExperienceForm = (props: any) => {
    const { editRecordData, handleCloseModal, profileUserId } = props;
    const { updateProfileBasicDetails } = userProfileServices();
    const theme = useTheme();
    const showSnackbar = useSnackbar();
    const [loader, setLoader] = useState<boolean>(false);
    const { user } = useUser();

    // Form validation schema
    const validationSchema = Yup.object({
        title: Yup.string().required('Title is required').max(255, 'Title must be at most 255 characters long'),
        link: Yup.string().max(255, 'Link must be at most 255 characters long'),
        description: Yup.string().required('Description is required').max(1024, 'Description must be at most 1024 characters long')
    });

    // Formik hook
    const formik = useFormik({
        initialValues: {
            id: editRecordData?.id || null,
            title: editRecordData?.title || '',
            link: editRecordData?.link || '',
            description: editRecordData?.description || '',
        },
        validationSchema,
        enableReinitialize: true, // Reinitialize form if `editRecordData` changes
        onSubmit: async (values) => {
            setLoader(true);
            let payload: any = values;
            if (user?.isSuperadmin || user?.isOrgadmin) { payload['userId'] = profileUserId }
            const resUpdateUser = await updateProfileBasicDetails(payload, 'userexperience');
            if (resUpdateUser?.success) {
                showSnackbar(resUpdateUser?.message, 'success');
                handleCloseModal && handleCloseModal('work-experience');
            } else {
                showSnackbar(resUpdateUser?.data?.message || 'An error occurred', 'error');
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
                onClose={handleCloseModal}
                scroll={'paper'}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Project Highlights</DialogTitle>
                <DialogContent dividers={true}>
                    <DialogContentText tabIndex={-1}>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <TextField
                                    required
                                    className="w-100"
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
                                    id="link"
                                    name="link"
                                    label="Link"
                                    color="primary"
                                    variant="outlined"
                                    placeholder="Enter link"
                                    value={formik.values.link}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.link && Boolean(formik.errors.link)}
                                    helperText={formik.touched.link && String(formik.errors.link || '')}
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

export default ExperienceForm;
