import './summarylist.scss'
import { useNavigate } from 'react-router-dom';
import { dummyUserImage, profile_small_logo } from "../../services/mock_data"
import { Button } from '@mui/material';
import { IMAGEPATH } from '../../services/api-helper';

const SummaryList = (props: any) => {
    const { profiles } = props
    const navigate = useNavigate();

    const redirectDetailPage = (sysName: any) => {
        navigate(`/profile/${sysName}`);
    }

    return (
        <div >
            {profiles?.length > 0 && profiles?.map((data: any, index: any) => {
                return (
                    <div className="card box-shadow mt-4 p-4" >
                        <div className="row" key={index}>
                            <div className="col-md-3">
                                <div className="position-relative">
                                    <div className="image-wrapper-summary">
                                        <img src={data.profileImage ? `${IMAGEPATH + data.profileImage}` : dummyUserImage} alt="user image" />
                                    </div>
                                    <div className="position-absolute triangle-bottom">
                                        <img height="25" src={profile_small_logo} alt="user" className="triangle-image" />
                                    </div>
                                </div>
                                <Button onClick={() => redirectDetailPage(data?.sysName)} variant="contained" color='primary' className='w-100 mt-3'>View {data?.firstName}</Button>
                            </div>
                            <div className="col-md-9 position-relative">
                                <div className='mt-1'>
                                    <h5 className="text-secondary mb-0">{data?.firstName} {data?.lastName}</h5>
                                    <label className='text-muted small-font text-capitalize'>{data?.slogan}</label>
                                    <div className='d-flex align-items-center mt-2 gap-4 medium-font'>

                                        {data?.jobTitle && (
                                            <label className="d-flex align-items-center text-muted">
                                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M184.62-160q-27.62 0-46.12-18.5Q120-197 120-224.62v-390.76q0-27.62 18.5-46.12Q157-680 184.62-680H360v-55.39q0-27.61 18.5-46.11t46.12-18.5h110.76q27.62 0 46.12 18.5Q600-763 600-735.39V-680h175.38q27.62 0 46.12 18.5Q840-643 840-615.38v390.76q0 27.62-18.5 46.12Q803-160 775.38-160H184.62Zm0-40h590.76q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93v-390.76q0-9.24-7.69-16.93-7.69-7.69-16.93-7.69H184.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.93v390.76q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69ZM400-680h160v-55.39q0-9.23-7.69-16.92-7.69-7.69-16.93-7.69H424.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.92V-680ZM160-200v-440 440Z" /></svg>
                                                {data?.jobTitle}
                                            </label>
                                        )}

                                        {data?.available?.length > 0 && (
                                            <label className="d-flex align-items-center gap-1 text-muted">
                                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-575.39h560v-119.99q0-9.24-7.69-16.93-7.69-7.69-16.93-7.69H224.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.93v119.99Zm0 0V-720-575.39ZM224.62-120q-27.62 0-46.12-18.5Q160-157 160-184.62v-510.76q0-27.62 18.5-46.12Q197-760 224.62-760h70.76v-89.23h43.08V-760h286.16v-89.23h40V-760h70.76q27.62 0 46.12 18.5Q800-723 800-695.38v210.07q-9.77-3.61-19.77-5.38T760-493.92v-41.46H200v350.76q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69h268.15q3.15 11.23 8.04 20.85 4.88 9.61 10.19 19.15H224.62Zm510.76 40q-66.84 0-113.42-46.58-46.58-46.57-46.58-113.42t46.58-113.42Q668.54-400 735.38-400q66.85 0 113.43 46.58 46.57 46.57 46.57 113.42t-46.57 113.42Q802.23-80 735.38-80Zm66.24-71.92 21.84-21.85-72.69-72.69v-108.92H720v121.84l81.62 81.62Z" /></svg>
                                                {data?.available}

                                            </label>
                                        )}
                                    </div>

                                    {/* about */}
                                    <div className='mt-3 text-muted medium-font'>
                                        <p className='mb-0'> {data?.bio?.length > 315 ? `${data?.bio?.slice(0, 315)}...` : data?.bio}</p>
                                        {data?.bio?.length > 315 && <label className='text-secondary cursor-pointer' onClick={() => redirectDetailPage(data?.sysName)}>Show More</label>}
                                    </div>

                                    {/* tags */}
                                    {data?.expertises?.tags?.length > 0 && (
                                        <div className='mt-4 bottom-0'>
                                            {data?.expertises?.tags?.slice(0, 12)?.map(({ skillName }: any, index: any) => {
                                                return (
                                                    <label key={index} className="rounded-pill small-font tags">
                                                        {skillName}
                                                    </label>
                                                )
                                            })}
                                            {data?.expertises?.tags?.length > 12 && (
                                                <label onClick={() => redirectDetailPage(data?.sysName)} className="rounded-pill small-font tags">
                                                    {`+ ${data?.expertises?.tags?.length - 12} more`}
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div >
    );
}

export default SummaryList