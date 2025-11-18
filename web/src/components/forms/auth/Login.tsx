import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from "react";
import { useSnackbar } from "../../../context/SnackbarContext";
import authServices from "../../../services/api-services/auth-api.service";
import { useUser } from "../../../context/UserContext";

const Login = (props: any) => {
    const { LoginUser, forgotPassword } = authServices();
    const navigate = useNavigate();
    const theme = useTheme();
    const showSnackbar = useSnackbar();

    const { handleCloseModal } = props;
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loader, setLoader] = useState<boolean>(false);
    const [forgotPwdModal, setForgotPwdModal] = useState<boolean>(false);
    const { setIsLoggedOut } = useUser();

    // Define validation schema with Yup
    const validationSchema = (forgotPwdModal: boolean = false) =>
        Yup.object({
            email: Yup.string()
                .email("Invalid email format")
                .required("Email is required"),
            password: forgotPwdModal
                ? Yup.string().notRequired()
                : Yup.string()
                    .min(6, "Password must be at least 6 characters")
                    .required("Password is required"),
        });

    // Use Formik for form state management and validation
    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: validationSchema(forgotPwdModal),
        onSubmit: async (values) => {
            // API CALL
            if (forgotPwdModal) {
                handleForgotPassword(values)
            } else {
                setLoader(true)
                const res = await LoginUser(values);
                if (res?.success) {
                    localStorage.setItem('token', res?.data?.token);
                    setIsLoggedOut && setIsLoggedOut(false);
                    if (res?.data?.roleName == 'user') { navigate(`/profile/${res?.data?.sysName || 'new'}`); }
                    else { navigate('/home'); }
                    handleCloseModal && handleCloseModal();
                    showSnackbar(res?.data?.message || 'Login successful', 'success');
                } else {
                    showSnackbar(res?.data?.message || 'An error occurred', 'error');
                }
                setLoader(false)
            }
        }
    });

    const handleForgotPassword = async (data: any) => {
        setLoader(true)
        const response = await forgotPassword({ email: data?.email });
        if (response?.success) {
            showSnackbar(response?.data?.message || 'Mail sent', 'success');
            handleCloseModal && handleCloseModal();
        } else {
            showSnackbar(response?.data?.message || 'An error occurred', 'error');
        }
        setLoader(false)
    }

    const buttonSx = {
        ...(loader && {
            bgcolor: theme.palette.primary.main,
        }),
    };

    return (

        <Dialog open={true} onClose={handleCloseModal} scroll={'paper'}>
            <DialogTitle>{forgotPwdModal ? 'Forgot Password' : 'Login'}</DialogTitle>
            <form
                onSubmit={formik.handleSubmit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        formik.submitForm();
                    }
                }}
            >
                <DialogContent dividers={true}>
                    <Typography component="div" tabIndex={-1} sx={{
                        width: forgotPwdModal ? { xs: "100%", sm: "500px" } : "100%",
                    }}>
                        <div className="row">
                            <div className="col-md-12">
                                <TextField
                                    required
                                    className="w-100"
                                    type="email"
                                    id="email"
                                    name="email"
                                    label="Email"
                                    color="primary"
                                    variant="outlined"
                                    placeholder="Enter email"
                                    value={formik?.values?.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.email && Boolean(formik?.errors?.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                    sx={{ marginBottom: { xs: 2, md: 0 } }}
                                />
                            </div>

                            {!forgotPwdModal && (
                                <div className="col-md-12 mt-4">
                                    <TextField
                                        required={forgotPwdModal ? false : true}
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-100"
                                        id="password"
                                        name="password"
                                        label="Password"
                                        color="primary"
                                        variant="outlined"
                                        placeholder="Enter password"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.password && Boolean(formik.errors.password)}
                                        helperText={formik.touched.password && formik.errors.password}
                                        sx={{ marginBottom: { xs: 2, md: 0 } }}
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
                                </div>
                            )}

                            <div className="d-flex justify-content-end mt-3">
                                <p
                                    onClick={() => { forgotPwdModal ? setForgotPwdModal(false) : setForgotPwdModal(true) }}
                                    className="medium-font m-0 text-secondary text-decoration-underline cursor-pointer"
                                >

                                    {forgotPwdModal ? 'Back to login' : 'Forgot password'}
                                </p>
                            </div>
                        </div>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} variant="outlined" color="primary">
                        Close
                    </Button>

                    <Box sx={{ m: 1, position: 'relative' }}>
                        <Button type="submit" color="primary" variant="contained" sx={buttonSx} disabled={loader || !formik.isValid || formik.isSubmitting} >
                            {forgotPwdModal ? 'Send mail' : 'Login'}
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
            </form>

        </Dialog>
    );
};

export default Login;