import {Button} from "../../components/ui/button.tsx";
import {Plus, UserRoundPlus} from "lucide-react";
import {selectTenantsByPropertyId} from "../../services/slices/objectSlice.js";
import {useSelector} from "react-redux";
import TenantTable from "../../components/tenants/TenantTable.tsx";
import {useNavigate} from "react-router-dom";
import { useTranslation } from 'react-i18next';


const Tenants = (props) => {
    const {propertySelection} = props;

    const navigate = useNavigate()
    const { t } = useTranslation();

    const tenants = useSelector(state => selectTenantsByPropertyId(state,propertySelection))


    return (
        <div className="flex flex-col">
            <h1>
                {t('navbar.tenants')}
            </h1>

            <div className="flex flex-row items-center gap-4 flex-wrap sm:flex-nowrap justify-between sm:-mt-2">
                <p className={"text-gray-500"}>
                    {t('tenants.desc')}
                </p>

                <Button variant="gradient" className="w-fit"
                        onClick={() => navigate("/tenants/create")}
                >
                    <Plus size={18} className="mr-1"/>
                    {t('tenants.addButton')}
                </Button>
            </div>

            <TenantTable tenants={tenants} />

        </div>
    )
}

export default Tenants;