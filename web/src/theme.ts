import { createTheme } from '@mui/material/styles';
const rootStyles = getComputedStyle(document.documentElement);
const primaryColor = rootStyles.getPropertyValue("--primary-color").trim();
const secondaryColor = rootStyles.getPropertyValue("--secondary-color").trim();

const theme = createTheme({
    palette: {
        primary: {
            // main: '#ac0f0f', // primary color
            main: primaryColor, // primary color
        },
        secondary: {
            main: secondaryColor,// secondary color
        },
        error: {
            main: "#f44336" // Error message color
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                contained: {
                    color: '#ffffff', // btn variant contained - text color
                },
            },
        },


        // FORMIC
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    // Apply the error border color for TextField components with the `error` state
                    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f44336',
                    },
                },
            },
        },
    },
});

export default theme;
