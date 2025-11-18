import { useEffect, useState } from "react";
import { CButton, CCard, CCol, CFormCheck, CFormInput, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from "@coreui/react";
import masterSerive from "../../services/api-services/master-api-service";
import { useToast } from "../../components/ToastContext";
import { Modal } from "react-bootstrap";

const Skills = (props) => {
    const { loader, setLoader } = props;
    const toast = useToast();
    const { fetchAllSkills, bulkUpdateSkills } = masterSerive()
    const [skills, setSkills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [displaySummary, setDisplaySummary] = useState(false);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        getAllSkills()
    }, []);

    const getAllSkills = async () => {
        try {
            setLoader(true)
            const resSkills = await fetchAllSkills()
            if (resSkills?.success) {
                const initialState = resSkills?.data?.map((e) => ({ ...e, new: "", update: false, delete: false })); //count: 1,
                setSkills(initialState);
            }
            setLoader(false)
        } catch (error) {
            setLoader(false)
            toast(error?.message || 'An error while fetch Skills', 'danger');
        }
    }

    const submit = async () => {
        try {
            setLoader(true);
            setSearchTerm('');
            const result = {
                delete: [],
                update: [],
            };

            skills.forEach(skill => {
                if (skill.delete) {
                    result?.delete?.push({ id: skill?.id, name: skill?.name });
                } else if (skill.update && skill?.new?.length > 0) {
                    result.update.push({
                        id: skill?.id,
                        old: skill?.name,
                        new: skill?.new?.trim(),
                    });
                }
            });

            if (result?.delete?.length > 0 || result?.update?.length > 0) {
                const resUpdate = await bulkUpdateSkills({ action: result });
                if (resUpdate?.success) {
                    setSummary(resUpdate?.data?.log);
                    setLoader(false);
                    getAllSkills();
                    toast(resUpdate?.data?.message || 'Success', 'success');
                } else {
                    setLoader(false);
                    toast(resUpdate?.data?.message || 'An error while bulk update skills', 'danger');
                }
            } else {
                setLoader(false);
                toast("Please Select Any Action", "danger");
            }
        } catch (error) {
            setLoader(false);
            toast(error?.message || 'An error', 'danger');
        }

    };


    const handleChange = (id, field, value) => {
        const alls = [...skills];
        const objSkills = alls?.find(x => x.id == id);
        if (objSkills) {
            objSkills[field] = value;
            if (field === "delete") { objSkills["new"] = null; }
            if (field === "update" && value == false) { objSkills["new"] = null; }
            if (field === "new") { objSkills["update"] = (value !== ""); }
        }
        setSkills(alls)
    }


    const clear = () => {
        const alls = [...skills]?.map((e, indx) => ({ ...e, new: "", update: false, delete: false }));
        setSkills(alls);
    }

    const filteredSkills = skills?.filter(skill =>
        skill?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );


    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4 p-3">
                        <div className="table-wrapper">
                            <CTable className="scrollable-table" >
                                <CTableHead >
                                    <CTableRow align="middle">
                                        <CTableHeaderCell scope="col" style={{ width: '5%' }}>No</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Skill</CTableHeaderCell>
                                        <CTableHeaderCell scope="col" style={{ width: '10%', textAlign: "center" }}>Used Count</CTableHeaderCell>
                                        <CTableHeaderCell scope="col" colSpan={3}>
                                            <div className="d-flex justify-content-end gap-2" >
                                                {summary && <CButton color="success" variant="outline" onClick={() => setDisplaySummary(true)} size="sm">View Summary</CButton>}
                                                <CButton color="primary" variant="outline" onClick={() => clear()} size="sm">Clear</CButton>
                                                <CButton color="primary" disabled={loader} onClick={() => submit()} size="sm">Submit</CButton>
                                            </div>
                                        </CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody className="scroll-body">

                                    {/*Row Search .. */}
                                    <CTableRow>
                                        <CTableHeaderCell ></CTableHeaderCell>
                                        <CTableHeaderCell style={{ width: '30%' }}>
                                            <CFormInput
                                                type="text"
                                                name="search"
                                                placeholder={"Search..."}
                                                value={searchTerm || ''}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            /></CTableHeaderCell>
                                        <CTableHeaderCell> </CTableHeaderCell>
                                        <CTableHeaderCell></CTableHeaderCell>
                                        <CTableDataCell></CTableDataCell>
                                        <CTableDataCell></CTableDataCell>

                                    </CTableRow>

                                    {filteredSkills?.length > 0 ? <>
                                        {filteredSkills?.map((item, index) => {
                                            return (
                                                <CTableRow key={item?.id || index} align="middle">
                                                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                                    <CTableDataCell>{item?.name}</CTableDataCell>
                                                    <CTableDataCell style={{ textAlign: "center" }}><span className="count"> {item?.count || 0}</span></CTableDataCell>

                                                    <CTableDataCell>
                                                        <CFormInput
                                                            type="text"
                                                            name="newSkillName"
                                                            placeholder={"Update skill"}
                                                            value={item.new || ""}
                                                            onChange={(e) => { handleChange(item.id, "new", e?.target?.value) }}
                                                            disabled={item?.delete == true}
                                                        />
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <CFormCheck
                                                            label="Update"
                                                            id={`update-check-${item?.id}`}
                                                            checked={item.update == true}
                                                            onChange={(e) => handleChange(item.id, 'update', e?.target?.checked)}
                                                            disabled={item?.delete == true}
                                                        />
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <CFormCheck
                                                            label="Delete"
                                                            id={`Delete-check-${item?.id}`}
                                                            checked={item.delete == true}
                                                            onChange={(e) => handleChange(item.id, 'delete', e?.target?.checked,)}
                                                            disabled={item?.update == true || item?.count != 0}
                                                        />
                                                    </CTableDataCell>
                                                </CTableRow>
                                            );
                                        })}
                                    </>
                                        :
                                        <CTableRow active>
                                            <CTableDataCell colSpan={6} className="text-center text-muted">
                                                <div>
                                                    <div>No skill found</div>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    }
                                </CTableBody>
                            </CTable>
                        </div>
                    </CCard>
                </CCol>



                {summary && displaySummary && (
                    <Modal size="lg" show={true} >
                        <Modal.Header>
                            <Modal.Title>Summary</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="d-flex justify-content-between">
                                <div className="mb-3">
                                    Updated Records: {summary?.update?.length}
                                </div>
                                <div className="mb-3">
                                    Deleted Records: {summary?.delete?.length}
                                </div>
                            </div>
                            
                            {summary.delete.length > 0 && (
                                <>
                                    <h6 className="mt-4">🗑️ Deleted Records</h6>
                                    <ul className="list-group">
                                        {summary.delete.map((item, index) => (
                                            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                <span><strong>{index + 1}.</strong> {item.name}</span>
                                                <span className="badge bg-danger">Deleted</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            {summary?.update?.length > 0 && (
                                <>
                                    <h6 className="mt-4">📝 Updated Records</h6>
                                    <div className="d-flex flex-column gap-2">
                                        {summary.update.map((item, index) => (
                                            <div
                                                key={item?.id}
                                                className="border rounded p-2"
                                                style={{ backgroundColor: "#f8f9fa" }}
                                            >
                                                <div className="row align-items-center text-center">
                                                    <div className="col-5 text-start">
                                                        <strong>{index + 1}.</strong> <span className="text-muted">{item?.old}</span>
                                                    </div>
                                                    <div className="col-2">
                                                        <span style={{ fontSize: "1.2rem" }}>➡️</span>
                                                    </div>
                                                    <div className="col-5 text-end">
                                                        <strong>{item?.new}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>

                            )}

                        </Modal.Body>

                        <Modal.Footer>
                            <CButton color="primary" variant="outline" onClick={() => { setSummary(null); setDisplaySummary(false) }} >Clear</CButton>
                        </Modal.Footer>
                    </Modal>
                )}
            </CRow>
        </>
    )
}

export default Skills

