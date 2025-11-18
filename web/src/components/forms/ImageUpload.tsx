import React, { useRef, useState, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import '../common.scss';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useSnackbar } from '../../context/SnackbarContext';
import { useUser } from '../../context/UserContext';
import fileUploadServices from '../../services/api-services/file-upload-api.service';
import userProfileServices from '../../services/api-services/user-profile-api.service';
import moment from 'moment';

const ImageUpload = (props: any) => {
    const { upload } = fileUploadServices();
    const { title, handleCloseModal, profileUserId, uploadProfileUrl } = props
    const showSnackbar = useSnackbar();
    const { user } = useUser();

    const [imgSrc, setImgSrc] = useState<string>('');
    const [crop, setCrop] = useState<any>({ unit: '%', width: 30, height: 30 });
    const [completedCrop, setCompletedCrop] = useState<any>(null);
    const imgRef = useRef<any>(null);
    const previewCanvasRef = useRef<any>(null);
    let millisecond = moment().millisecond();

    const onSelectFile = (e: any) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '');
                setCrop(null) // Reset crop on new image
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onImageLoad = (e: any) => {
        const { width, height } = e.currentTarget;
        const cropWidth = width / 2;
        const cropHeight = height / 2;
        const x = (width - cropWidth) / 2;
        const y = (height - cropHeight) / 2;

        setCrop({
            unit: 'px',
            width: cropWidth,
            height: cropHeight,
            x: x,
            y: y
        });
    };

    useEffect(() => {
        if (
            completedCrop?.width &&
            completedCrop?.height &&
            imgRef.current &&
            previewCanvasRef.current
        ) {
            const canvas = previewCanvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const image = imgRef.current;

            // Set canvas dimensions
            canvas.width = completedCrop.width;
            canvas.height = completedCrop.height;

            // Calculate the source dimensions and coordinates
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            ctx.drawImage(
                image,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                completedCrop.width,
                completedCrop.height
            );
        }
    }, [completedCrop]);


    const updateProfileImage = () => {
        const canvas = previewCanvasRef.current;
        if (!canvas) {
            console.log('No canvas found');
            alert('Select file.')//error
            // handleCloseModal && handleCloseModal()
            return;
        }

        canvas.toBlob(async (blob: any) => {
            if (!blob) {
                console.log('Canvas is empty');
                handleCloseModal && handleCloseModal()
                return;
            }
            const formData = new FormData();
            formData.append('file', blob, 'cropped-image.png');


            // API CALL
            try {
                const res = await upload(formData, `${profileUserId}-${millisecond}`, 'profile') //upload Image
                if (res?.success && res?.file) {
                    uploadProfileUrl(res?.file);
                } else {
                    showSnackbar(res?.data?.message || 'An error occurred', 'error');
                }

            } catch (error) {
                console.error("API Call Error:", error);
                return false;
            }

        }, 'image/png');

    }

    return (
        <Dialog
            open={true}
            scroll={'paper'}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>{title || 'Profile Image'}</DialogTitle>
            <DialogContent dividers={true}>
                <DialogContentText tabIndex={-1} >
                    <div className="row">
                        <div className="col-12">
                            <input type="file" accept="image/*" onChange={onSelectFile} className="form-control mb-3" />
                        </div>

                        <div className='row'>
                            {imgSrc && (
                                <div className="col-6 mb-3">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(newCrop) => setCrop(newCrop)}
                                        onComplete={(newCrop) => setCompletedCrop(newCrop)}
                                        // aspect={crop.width / crop.height}
                                        aspect={undefined} //crop.width / crop.height
                                    >
                                        <img
                                            ref={imgRef}
                                            alt="Crop me"
                                            src={imgSrc}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '400px',
                                                objectFit: 'cover',
                                            }}
                                            onLoad={onImageLoad}
                                        />
                                    </ReactCrop>
                                </div>
                            )}
                            {completedCrop && (
                                <div className="col-6 mb-3">
                                    <canvas
                                        ref={previewCanvasRef}
                                        style={{
                                            border: '1px solid black',
                                            width: completedCrop.width,
                                            height: completedCrop.height,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleCloseModal && handleCloseModal()} variant="outlined" color='primary' >Close</Button>
                <Button onClick={() => updateProfileImage()} variant="contained" color='primary'>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImageUpload;
