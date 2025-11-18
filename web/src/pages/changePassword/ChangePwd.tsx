import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TextField, Button, Box, Typography, Container, Alert, CircularProgress, useTheme, InputAdornment, IconButton } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import authServices from "../../services/api-services/auth-api.service";
import { useSnackbar } from "../../context/SnackbarContext";

const ChangePwd = () => {
    const { token } = useParams();
    const theme = useTheme();
    const showSnackbar = useSnackbar();
    const navigate = useNavigate();
    const { changePassword } = authServices();
    const [loader, setLoader] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Formik validation schema
    const validationSchema = Yup.object({
        newPassword: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("New Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("newPassword")], "New Password and Confirm Password should match")
            .required("Confirm Password is required"),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            newPassword: "",
            confirmPassword: "",
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoader(true)
            const res = await changePassword({ newPassword: values.newPassword }, token);
            if (res?.success) {
                showSnackbar(res?.data?.message || 'Password changed successfully.', 'success');
                redirectToHome();
            } else {
                showSnackbar(res?.data?.message || 'An error occurred', 'error');
            }
            setLoader(false)
        },
    });

    const redirectToHome = () => {
        navigate('/home');
    }

    const buttonSx = {
        ...(loader && {
            bgcolor: theme.palette.primary.main,
        }),
    };

    return (
        <Container maxWidth="sm" className="mt-5">
            <Box boxShadow={3} p={4} borderRadius={2} className="bg-light">
                <Typography variant="h5" className="mb-4 text-center">
                    Change Password
                </Typography>

                <form
                    onSubmit={formik.handleSubmit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            formik.handleSubmit();
                        }
                    }}
                    className="mt-3"
                >
                    <TextField
                        required
                        className="w-100"
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        id="newPassword"
                        name="newPassword"
                        value={formik?.values?.newPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        helperText={formik.touched.newPassword && formik.errors.newPassword}
                        error={formik?.touched?.newPassword && Boolean(formik?.errors?.newPassword)}
                    />

                    <TextField
                        required
                        label="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
                        <p onClick={() => redirectToHome()} className="medium-font m-0 text-secondary text-decoration-underline cursor-pointer" >
                            Back to Home
                        </p>

                        <Box sx={{ position: "relative" }}>
                            <Button
                                type="submit"
                                color="primary"
                                variant="contained"
                                sx={buttonSx}
                                disabled={loader || !formik.isValid || formik.isSubmitting}
                            >
                                Change Password
                            </Button>
                            {loader && (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: theme?.palette?.primary?.main || "blue",
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        marginTop: "-12px",
                                        marginLeft: "-12px",
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                </form>
            </Box>
        </Container>
    );
};

export default ChangePwd;
