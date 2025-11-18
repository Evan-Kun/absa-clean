import '../common.scss'
import { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, CircularProgress, createFilterOptions, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Toolbar, Tooltip, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from '../../context/SnackbarContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import userProfileServices from '../../services/api-services/user-profile-api.service';
import { capitalize } from '../../services/utils';
import { useUser } from '../../context/UserContext';
import commonApiServices from '../../services/api-services/common-api.service';

const ExperienceTagForm = (props: any) => {
    const { editRecordData, handleCloseModal, profileUserId } = props;
    const { updateProfileBasicDetails } = userProfileServices();
    const { saveSkill } = commonApiServices();
    const showSnackbar = useSnackbar();
    const theme = useTheme();
    const { user, skillsList, setSkillsList } = useUser();
    const [loader, setLoader] = useState<boolean>(false);
    const [experienceTags, setExperienceTags] = useState<any>([]);
    const [editingIndex, setEditingIndex] = useState<any>(null);
    const [openSkillsDropDown, setOpenSkillsDropDown] = useState(false);

    useEffect(() => {
        if (editRecordData?.tags) { setExperienceTags(editRecordData?.tags) }
    }, [editRecordData])

    // Form validation schema
    const validationSchema = Yup.object({
        skillName: Yup.string().required('Skill is required'),
        level: Yup.string().required('Level is required')
    });

    // Formik hook
    const formik = useFormik({
        initialValues: {
            // ...editRecordData,
            id: editRecordData?.id || null,
            skillName: editRecordData?.skillName || '',
            level: editRecordData?.level || '',
            isHighlighted: editRecordData?.isHighlighted || false,
        },
        validationSchema,
        enableReinitialize: true, // Reinitialize form if `editRecordData` changes
        onSubmit: async (values, { resetForm, setFieldError }) => {
            const newVal = { skillName: values.skillName, level: values.level, isHighlighted: values?.isHighlighted || false };

            const isDuplicateList = experienceTags.some(
                (val: any, index: any) => (val?.skillName?.toLowerCase() === newVal?.skillName?.toLowerCase() && index !== editingIndex)
            );


            if (isDuplicateList) {
                setFieldError('skillName', 'This Skill already exists.');
                return;
            }

            const isExistingSkill = skillsList?.find((i: any) => i?.toLowerCase() == newVal?.skillName?.toLowerCase()) || null;
            if (!isExistingSkill) {
                const resSave = await saveSkill({ "name": newVal?.skillName })
                setSkillsList((prev: any) => {
                    return [...new Set([...prev, resSave?.data?.name])]
                });
            }

            if (editingIndex !== null) {
                const updatedTags = experienceTags.map((tag: any, index: number) =>
                    index === editingIndex ? newVal : tag
                );
                setExperienceTags(updatedTags);
                setEditingIndex(null);
            } else {
                let value = [...experienceTags, newVal]
                if (isExistingSkill) { value = [...experienceTags, { ...newVal, skillName: isExistingSkill }] }
                setExperienceTags(value);
            }
            resetForm();
        }
    });

    const removeExperienceTag = (index: any) => {
        const updatedTags = experienceTags.filter((item: any, i: any) => i !== index);
        setExperienceTags(updatedTags);
    };

    const editExperienceTag = (index: number) => {
        const tagToEdit = experienceTags[index];
        formik.setValues({
            id: index,
            skillName: tagToEdit.skillName,
            level: tagToEdit.level,
            isHighlighted: tagToEdit.isHighlighted || false,
        });
        setEditingIndex(index);
    };

    const updateExperienceTag = async () => {
        setLoader(true);
        let payload: any = { id: editRecordData?.id || null, experienceTags };
        if (user?.isSuperadmin || user?.isOrgadmin) { payload['userId'] = profileUserId }
        const resUpdateUser = await updateProfileBasicDetails(payload, 'expertise');

        if (resUpdateUser?.success) {
            showSnackbar(resUpdateUser?.message, 'success');
            handleCloseModal && handleCloseModal('work-experience');
        } else {
            showSnackbar(resUpdateUser?.data?.message || 'An error occurred', 'error');
        }
        setLoader(false);
    };

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
            <DialogTitle>Skills Tag</DialogTitle>
            <DialogContent dividers={true}>
                <DialogContentText tabIndex={-1} >
                    <div className="row">
                        <div className="col-md-12">
                            <div className="mb-3 skill-tag-wrapper">
                                <div className='d-flex align-items-center flex-wrap'>
                                    {experienceTags?.length > 0 && experienceTags?.map((data: any, i: any) => {
                                        return (
                                            <div key={i} className="text-muted small-font rounded-pill tags">
                                                <Tooltip title="Edit Skill" arrow>
                                                    <label key={i} onClick={() => editExperienceTag(i)}  >
                                                        {data?.skillName} - {data?.level}
                                                    </label>
                                                </Tooltip>

                                                <Tooltip title="Remove Skill" arrow>
                                                    <IconButton onClick={() => removeExperienceTag(i)}><CloseIcon sx={{ fontSize: "12px", padding: "0" }} /></IconButton>
                                                </Tooltip>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-5 mb-2">
                            <FormControl fullWidth>
                                <Autocomplete
                                    className='w-100'
                                    options={skillsList}
                                    freeSolo
                                    open={openSkillsDropDown}
                                    onOpen={() => {
                                        if (formik.values.skillName.trim() !== "") {
                                            setOpenSkillsDropDown(true);
                                        }
                                    }}
                                    onClose={() => setOpenSkillsDropDown(false)}
                                    value={formik.values.skillName || ''}
                                    renderInput={(params) => <TextField
                                        {...params}
                                        label="Skill"
                                        onBlur={(e) => {
                                            const inputValue = e.target?.value?.trim();
                                            formik.setFieldValue('skillName', inputValue || '');
                                        }}
                                        onChange={(e) => {
                                            if (e.target.value?.trim() !== '') {
                                                setOpenSkillsDropDown(true)
                                            } else { setOpenSkillsDropDown(false) }
                                        }}
                                        error={formik.touched.skillName && Boolean(formik.errors.skillName)}
                                        helperText={formik?.touched?.skillName && String(formik?.errors?.skillName || '')}
                                    />}
                                />
                            </FormControl>
                        </div>
                        <div className="col-md-5 mb-2">
                            <FormControl fullWidth>
                                <InputLabel id="level-select-label">Level</InputLabel>
                                <Select
                                    className='w-100'
                                    labelId="level-select-label"
                                    id="level-select"
                                    value={formik.values.level || ''}
                                    label="Level"
                                    name='level'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.level && Boolean(formik.errors.level)}
                                >
                                    <MenuItem value={'Expert'}>Expert</MenuItem>
                                    <MenuItem value={'Strong'}>Strong</MenuItem>
                                    <MenuItem value={'Competent'}>Competent</MenuItem>
                                </Select>
                                {formik.touched.level && formik.errors.level && (
                                    <p style={{ color: theme.palette.error.main, fontSize: '12px' }}>{String(formik.errors.level || '')}</p>
                                )}
                            </FormControl>
                        </div>
                        <div className="col-md-1 d-flex align-items-center">
                            <Button onClick={() => formik.submitForm()} variant="contained" color='primary'>Add</Button>
                        </div>
                    </div>
                    <p className='text-muted'>New skill can be added by typing a new entry.</p>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseModal} variant="outlined" color='primary'>Close</Button>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button color='primary' variant="contained" sx={buttonSx} disabled={loader} onClick={() => updateExperienceTag()}>
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

export default ExperienceTagForm;
