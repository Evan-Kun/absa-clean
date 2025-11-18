import { CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CForm, CFormInput, CSpinner } from '@coreui/react'
import { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import 'ckeditor5/ckeditor5.css';
import DataTable from '../../components/common/DataTable';
import pageService from '../../services/api-services/page-api.service';
import { useToast } from '../../components/ToastContext';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../services/api-helper';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { customUploadAdapterPlugin } from '../../services/ckeditorePlugin';

const Pages = (props) => {
    const { loader, setLoader } = props;
    const { createOrUpdatePage, fetchPages, deletePage } = pageService();
    const toast = useToast();
    const [data, setData] = useState([]);
    const [formView, setFormView] = useState(false)
    const [formValue, setFormValue] = useState({});
    const [validated, setValidated] = useState(false)
    const [paginations, setPaginations] = useState()
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [showDescriptionModal, setShowDescriptionModal] = useState(null);
    const [page, setPage] = useState(DEFAULT_PAGE);
    const [limit, setLimit] = useState(DEFAULT_LIMIT)

    useEffect(() => {
        getPages();
    }, [page, limit])

    const getPages = async () => {
        try {
            setLoader(true)
            const resPage = await fetchPages(page, limit, 'all');
            if (resPage?.data?.length > 0) {
                const resData = resPage?.data?.map((item) => {
                    return {
                        id: item?.id,
                        pageName: item?.pageName,
                        title: item?.title,
                        status: item?.isActive ? "Active" : "Inactive",
                        row_data: item
                    }
                })
                setData(resData);
                setPaginations(resPage?.pagination);
            }
            else setData([])
        } catch (error) {
            toast(error?.message || 'An error while fetch pages', 'danger');
        }
        setLoader(false)
    }

    const handleEdit = (item) => {
        setFormView(true)
        setFormValue({
            ...item,
            title: item?.title || '',
            pageName: item?.pageName || '',
            description: item?.description || '',
        })
    };

    const deleteButton = (row) => {
        setShowDeleteModal(row);
    }

    const handleDelete = async () => {
        try {
            setLoader(true);
            const resRemovePage = await deletePage(showDeleteModal?.id)
            if (resRemovePage?.success) {
                toast(resRemovePage?.data?.message, 'success');
                setShowDeleteModal(false);
                await getPages();
            }
            else toast('An error occurred while delete page', 'danger');
        }
        catch (error) { toast('An error occurred during handleDelete', 'danger'); }
        setLoader(false);
    }

    const handlePageStatus = async (row) => {
        try {
            setLoader(true)
            const resPage = await createOrUpdatePage(
                {
                    id: row?.id,
                    pageName: row?.pageName,
                    isActive: row?.isActive ? false : true,
                })
            if (resPage?.success) {
                toast(`Page ${row?.isActive ? 'inactived' : 'actived'}`, 'success');
                setLoader(false)
                await getPages();
            }
            else {
                toast('An error occurred while update page status', 'danger')
                setLoader(false)
            };
        }
        catch (error) { toast('An error occurred during handlePageStatus', 'danger'); }
    }

    const customActions = (row, index) => {
        return (<>
            <CButton key={index} color={`${row?.isActive ? "danger" : "primary"}`} size='sm' onClick={() => handlePageStatus(row)}>{`${row?.isActive ? "Make Inactive" : "Make Active"}`}</CButton>
        </>)
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValue({
            ...formValue,
            [name]: value
        })
    }
    const onPagination = async (newPage, itemsPerPage) => {
        setPage(newPage);
        setLimit(itemsPerPage);
    };


    const handleClose = () => {
        setFormValue({});
        setValidated(false);
        setFormView(false);
    }

    const handleSaveData = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();

        if (form?.checkValidity() === false) {
            setValidated(true);
        } else {
            setLoader(true);
            let resCreatePage;

            try {
                const playload = { ...formValue, pageName: formValue?.pageName?.trim() };
                resCreatePage = await createOrUpdatePage(playload);

                if (resCreatePage?.success) {
                    toast('Page details saved successfully', 'success');
                    await getPages();
                    setFormValue({});
                    setFormView(false);
                    setValidated(false);
                }
                else {
                    toast(resCreatePage?.data?.message || 'An error occurred', 'danger');
                }
            } catch (error) {
                console.error('Error during form submission: ', error);
                toast('An error occurred during form submission', 'danger');
            }
            setLoader(false);
        }
    }

    return (<>
        <CRow>
            <CCol xs={12}>
                {!formView ? (
                    <CCard className="mb-4">
                        <CCardHeader className='d-flex justify-content-between'>
                            <div>
                                <strong>Pages List</strong>
                            </div>
                            <CButton color="primary" size='sm' onClick={() => setFormView(true)}>Add Page</CButton>
                        </CCardHeader>
                        <CCardBody className='pb-0'>
                            <DataTable
                                columns={['PageName', 'Title', 'Status']}
                                data={data}
                                customActions={customActions}
                                onEdit={handleEdit}
                                onDelete={deleteButton}
                                onPagination={onPagination}
                                paginations={paginations}
                            />
                        </CCardBody>
                    </CCard>
                ) : (
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>Add Page</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CForm noValidate validated={validated} onSubmit={handleSaveData}>
                                <div className="row mb-4 ">
                                    <CCol md={5}>
                                        <CFormInput required feedbackInvalid="Please Enter Pagename" type="text" id="pageName" name='pageName' value={formValue?.pageName} onChange={handleChange} placeholder="Pagename" />
                                    </CCol>
                                    <CCol md={5}>
                                        <CFormInput required feedbackInvalid="Please Enter Title" type="text" id="title" name='title' value={formValue?.title} onChange={handleChange} placeholder="Title" />
                                    </CCol>
                                    <CCol xs={2}>
                                        <div className='d-flex gap-2'>
                                            <CButton color="primary" type="submit" disabled={loader}>Save</CButton>
                                            <CButton color="primary" size='sm' variant="outline" type="button" onClick={() => handleClose()}>Cancel</CButton>
                                        </div>
                                    </CCol>
                                </div>
                                <CCol xs={12}>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        config={{
                                            licenseKey: 'GPL',
                                            height: '500px',
                                            extraPlugins: [customUploadAdapterPlugin],
                                        }}
                                        data={formValue?.description}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            setFormValue({
                                                ...formValue,
                                                description: data,
                                            });
                                        }}
                                    />
                                </CCol>
                            </CForm>
                        </CCardBody>
                    </CCard>
                )}
            </CCol>
        </CRow>
        {showDeleteModal && (
            <Modal show={true} onHide={() => setShowDeleteModal(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Page</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure want to delete page!</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(null)}>
                        Close
                    </Button>
                    <Button variant="primary" disabled={loader} onClick={!loader && handleDelete}>
                        Delete Page {loader && <CSpinner size="sm" />}
                    </Button>
                </Modal.Footer>
            </Modal>
        )}

        {showDescriptionModal && (
            <Modal size="lg" show={true} onHide={() => setShowDescriptionModal(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Description</Modal.Title>
                </Modal.Header>
                <Modal.Body><div dangerouslySetInnerHTML={{ __html: showDescriptionModal }} /></Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDescriptionModal(null)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        )}
    </>)
}

export default Pages

