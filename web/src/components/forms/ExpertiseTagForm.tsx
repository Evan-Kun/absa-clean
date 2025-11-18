import { useEffect, useState } from "react";
import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, useTheme } from "@mui/material";
import { useSnackbar } from "../../context/SnackbarContext";
import userProfileServices from "../../services/api-services/user-profile-api.service";
import { useUser } from "../../context/UserContext";

const ExpertiseTagForm = (props: any) => {
    const { editRecordData, handleCloseModal, profileUserId } = props;
    const { updateProfileBasicDetails } = userProfileServices();
    const [expertiseTag, setExpertiseTag] = useState<any>([]);
    const [loader, setLoader] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<any>("");
    const showSnackbar = useSnackbar();
    const theme = useTheme();
    const { user } = useUser();


    useEffect(() => {
        if (editRecordData?.tags) {
            setExpertiseTag(editRecordData?.tags);
        }
    }, [editRecordData]);

    const handleChange = (data: any, index: any) => (event: any) => {
        const { checked } = event.target;
        setExpertiseTag((prevTags: any) =>
            prevTags.map((tag: any) =>
                tag.skillName === data?.skillName && tag.level === data?.level
                    ? { ...tag, isHighlighted: checked }
                    : tag
            )
        );
    };

    const filteredTags = expertiseTag.filter((tag: any) =>
        tag?.skillName?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );

    const UpdateExpertiseTag = async () => {
        setLoader(true);
        let payload: any = { id: editRecordData?.id || null, experienceTags: expertiseTag };
        if (user?.isSuperadmin || user?.isOrgadmin) { payload['userId'] = profileUserId }
        const resUpdateUser = await updateProfileBasicDetails(payload, 'expertise');
        if (resUpdateUser?.success) {
            showSnackbar(resUpdateUser?.message, 'success');
            handleCloseModal && handleCloseModal('work-experience');
        } else {
            showSnackbar(resUpdateUser?.data?.message || 'An error occurred', 'error');
        }
        setLoader(false);
    }

    const buttonSx = {
        ...(loader && {
            bgcolor: theme.palette.primary.main,
        }),
    };

    return (
        <Dialog
            open={true}
            onClose={handleCloseModal}
            scroll={'paper'}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Expertise Tag</DialogTitle>
            <DialogContent dividers={true}>
                <DialogContentText tabIndex={-1} >
                    <div className="row">
                        {expertiseTag?.length > 0 ? 
                        <div className="col-md-12">
                            <TextField
                                label="Search Skill"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <TableContainer>
                                <Table sx={{ minWidth: 350 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left"></TableCell>
                                            <TableCell align="left" className="text-muted">Skill</TableCell>
                                            <TableCell align="left" className="text-muted">Proficiency</TableCell>
                                            <TableCell align="left"></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {console.log("filteredTags", filteredTags)}
                                        {filteredTags?.length > 0 ? filteredTags?.map((data: any, index: any) => (
                                            <TableRow key={index} >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        color="primary"
                                                        checked={data?.isHighlighted || false}
                                                        onChange={handleChange(data, index)}
                                                    />
                                                </TableCell>
                                                <TableCell align="left" className="text-muted">{data?.skillName}</TableCell>
                                                <TableCell align="left" className="text-muted">{data?.level}</TableCell>
                                                <TableCell align="left" className="text-muted"></TableCell>
                                            </TableRow>
                                        )) :
                                            <p className="text-muted">No skills found.</p>
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                        : <p className="text-muted">Tips: Use the Skills section below to add or change your skills first. Then select a subset of your skills to highlight using this section.</p>}
                    </div>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseModal} variant="outlined" color='primary'>Close</Button>
                {filteredTags.length > 0 &&
                    <Box sx={{ m: 1, position: 'relative' }}>
                        <Button color='primary' variant="contained" sx={buttonSx} disabled={loader} onClick={() => UpdateExpertiseTag()}>
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
                }
            </DialogActions>
        </Dialog>
    );
}

export default ExpertiseTagForm;
