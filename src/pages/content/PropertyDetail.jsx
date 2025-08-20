import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "../../components/ui/table.tsx";
import {Button} from "../../components/ui/button.tsx";
import {useDeletePropertyMutation} from "../../services/api/propertyApi.js";
import {useNavigate, useParams} from "react-router-dom";
import { useTranslation } from 'react-i18next';


const PropertyDetail = (props) => {
    const {data} = props;

    const { id } = useParams();
    const navigate = useNavigate();

    const [deleteProperty, {isLoading: isDeleting}] = useDeletePropertyMutation();
    const { t } = useTranslation();

    return (
        <div>
            <div className="flex flex-row justify-between">
                <h1>
                    {data?.data?.title}
                </h1>
                <Button variant="destructive" isLoading={isDeleting} onClick={() => deleteProperty(id).then(()=> navigate('/properties')) }>
                    {t('propertyDetail.deleteButton')}
                </Button>
            </div>

            {t('propertyDetail.dbTableIntro')} <br/>

            <Table>
                <TableCaption >{t('propertyDetail.tableCaption')}</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead key={0}>{t('propertyDetail.columns.title')}</TableHead>
                        <TableHead key={1}>{t('propertyDetail.columns.value')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell key={0}>{t('propertyDetail.fields.id')}</TableCell>
                        <TableCell key={1}>{data?.data?.id}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>{t('propertyDetail.fields.title')}</TableCell>
                        <TableCell key={1}>{data?.data?.title}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>{t('propertyDetail.fields.description')}</TableCell>
                        <TableCell key={1}>{data?.data?.description}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>{t('propertyDetail.fields.realEstateType')}</TableCell>
                        <TableCell key={1}>{data?.data?.realEstateType}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>{t('propertyDetail.fields.marketPrice')}</TableCell>
                        <TableCell key={1}>{data?.data?.marketPrice || "-"}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>{t('propertyDetail.fields.lotSize')}</TableCell>
                        <TableCell key={1}>{data?.data?.lotSize || "-"}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>{t('propertyDetail.fields.yearBuilt')}</TableCell>
                        <TableCell key={1}>{data?.data?.yearBuilt || "-"}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell key={0}>{t('propertyDetail.fields.units')}</TableCell>
                        <TableCell key={1}>
                            {data?.data?.units?.map((unit, index) => (
                                <div key={index}>
                                    {t('propertyDetail.unitLabel', { id: unit.id })}
                                </div>
                            ))}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

    )
}

export default PropertyDetail;