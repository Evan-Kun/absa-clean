import { useEffect, useState, useContext } from 'react';
import pageServices from '../../services/api-services/page-api.service';
import { useParams } from 'react-router-dom';
import { useSnackbar } from '../../context/SnackbarContext';
import { useNavigate } from 'react-router-dom';
import { header_menu } from '../../services/utils';
import Home from '../home/Home';
import { LoadingContext } from '../../App';

const PageContent = ({
    pageName = null
}: any) => {
    const { fetchPage } = pageServices();
    const routeParams = useParams();
    const { setLoading } = useContext(LoadingContext);
    const activePage = pageName || routeParams.pageName;
    const [pageDetail, setPageDetail] = useState<any>({});
    const showSnackbar = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        getPage();
    }, [activePage]);

    const getPage = async () => {
        setLoading(true);
        const resPage = await fetchPage(activePage);
        if (resPage?.success) {
            setLoading(false);
            setPageDetail(resPage?.data)
        } else {
            setLoading(false);
            setPageDetail({});
            showSnackbar(resPage?.data?.data?.message, 'error');
            navigate('/home')
        }
    }

    return (
        <>
            <div className='ck-content'>
                <div dangerouslySetInnerHTML={{ __html: pageDetail?.description || "" }} />
            </div>
            {activePage == header_menu.MEMBERS_PAGE && (<Home />)}
        </>
    );
}
export default PageContent