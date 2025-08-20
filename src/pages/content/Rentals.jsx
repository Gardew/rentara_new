
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {Button} from "../../components/ui/button.tsx";
import {Plus, PlusIcon} from "lucide-react";
import RentalTable from "../../components/rentals/RentalTable.tsx";
import {selectAllTenants, selectTenantByLeaseId, selectUnitsByPropertyId} from "../../services/slices/objectSlice.js";
import { useTranslation } from 'react-i18next';


const Rentals = (props) => {
    const {propertySelection} = props;

    const navigate = useNavigate();
    const { t } = useTranslation();

    const tenants = useSelector((state) => selectAllTenants(state));

    const units = useSelector((state) => selectUnitsByPropertyId(state, propertySelection)).map(unit => {
        const tenant = tenants.find(tenant => tenant.id === unit.tenantId)
        return {
            ...unit,
            tenant: tenant
        }
    })

    
    return (
        <>
            <h1>
                {t('rentals.title')}
            </h1>


            <p className="text-md mb-3 text-gray-500">
                {t('rentals.desc')}

            </p>

                <RentalTable units={units} />
        </>

    )
}

export default Rentals;