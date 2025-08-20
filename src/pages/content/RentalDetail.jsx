import {useParams} from "react-router-dom";
import RentalKeyCard from "../../components/rentals/RentalKeyCard.js";
import {Label} from "../../components/ui/label.tsx";
import {BathIcon, BedIcon, CarFront, FilePlus2, LandPlot} from "lucide-react";
import {dateParser, numberToLiteral} from "../../utils/formatters.js";
import TenantCard from "../../components/rentals/TenantCard.js";
import {useSelector} from "react-redux";
import {
    selectExpensesByUnitId,
    selectMaintenanceReportsByUnitId,
    selectPropertyByUnitId,
    selectTenantById
} from "../../services/slices/objectSlice.js";
import LeaseHistory from "../../components/leases/LeaseHistory.tsx";
import {Button} from "../../components/ui/button.tsx";
import AddLease from "../../components/leases/AddLease.js";
import {useState} from "react";
import PropertySheet from "../../components/properties/PropertySheet.js";
import {Tabs, TabsContent, TabsItem, TabsList} from "../../components/ui/tabs-new.tsx";
import MaintenanceTable from "../../components/maintenance/MaintenanceTable.tsx";
import ExpensesTable from "../../components/financials/ExpensesTable.tsx";
import RentalImagesCard from "../../components/rentals/RentalImagesCard.js";
import { useTranslation } from 'react-i18next';


const RentalDetail = (props) => {
    const {data} = props;

    const { id } = useParams();

   // const navigate = useNavigate();

    const property = useSelector(state => selectPropertyByUnitId(state, Number(id)));

    const tenant = useSelector(state => selectTenantById(state, data?.data?.tenantId))

    const maintenanceReports = useSelector(state => selectMaintenanceReportsByUnitId(state, Number(id)));

    const expenses = useSelector(state => selectExpensesByUnitId(state, Number(id)))

    const [showLeaseModal, setShowLeaseModal] = useState(false);

    const { t } = useTranslation();

    if (!data || !property  || !maintenanceReports || !expenses) {
        return (
            <div>
                {t('common.loading')}
            </div>
        )
    }

    console.log(expenses)

    return (
        <>

            <div className="flex justify-between">
                <h1>
                    {data?.data.unitIdentifier || t('rentalDetail.fallbackTitle')}
                </h1>
                <PropertySheet property={property} />
            </div>

            <p className="text-muted-foreground mb-4">
                {t('rentalDetail.intro')}
            </p>

            <Tabs defaultValue="details">
                <TabsList>
                    <TabsItem value="details">
                        {t('rentalDetail.tabs.details')}
                    </TabsItem>
                    <TabsItem value="leases">
                        {t('rentalDetail.tabs.leases')}
                    </TabsItem>
                    <TabsItem value="maintenance">
                        {t('rentalDetail.tabs.maintenance')}
                    </TabsItem>
                    <TabsItem value="expenses">
                        {t('rentalDetail.tabs.expenses')}
                    </TabsItem>
                </TabsList>
                <TabsContent value="details" className="flex flex-col gap-8">
                    <div className="flex flex-row flex-wrap flex-shrink justify-start w-[100%] gap-8">
                        <RentalKeyCard unit={data?.data} isSingleUnit={property?.units?.length === 1}/>

                        <TenantCard tenant={tenant}/>
                    </div>

                    <div className="flex flex-row gap-8 w-full">
                        <div
                            className="hidden xs:flex flex-row border-2 h-fit border-border rounded-xl flex-grow justify-around">
                            <div className="flex flex-col gap-1 border-border p-3 ">
                                <Label className="font-500 text-muted-foreground text-md">
                                    {t('rentalDetail.labels.bedroom')}
                                </Label>
                                <div className="flex flex-row gap-3 text-foreground font-600">
                                    <BedIcon size={24} className="text-muted-foreground"/>
                                    {numberToLiteral(data?.data?.numOfBedrooms)}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 p-3 border-l-2 border-border ">
                                <Label className="font-500 text-muted-foreground text-md">
                                    {t('rentalDetail.labels.bathroom')}
                                </Label>
                                <div className="flex flex-row gap-3 text-foreground font-600 ">
                                    <BathIcon size={24} className="text-muted-foreground"/>
                                    {numberToLiteral(data?.data?.numOfBathrooms)}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 p-3 border-l-2 border-border">
                                <Label className="font-500 text-muted-foreground text-md">
                                    {t('rentalDetail.labels.unitSize')}
                                </Label>
                                <div className="flex flex-row gap-3 text-foreground font-600">
                                    <LandPlot size={24} className="text-muted-foreground"/>
                                    {!data?.data?.unitSize ? t('rentalDetail.na') : (data?.data?.unitSize + " sqm")}
                                </div>
                            </div>

                            <div className="hidden sm:flex flex-col gap-1 p-3 border-l-2 border-border">
                                <Label className="font-500 text-muted-foreground text-md">
                                    {t('rentalDetail.labels.garages')}
                                </Label>
                                <div className="flex flex-row gap-3 text-foreground font-600">
                                    <CarFront size={24} className="text-muted-foreground"/>
                                    {data?.data?.garages || t('rentalDetail.na')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <RentalImagesCard unit={data?.data} />



                </TabsContent>

                <TabsContent value="leases">
                    <div className={"border-2 border-border p-4 rounded-lg"}>
                        <LeaseHistory leases={data?.data?.leases}
                                      subtitle={t('rentalDetail.leasesSubtitle', { unit: data?.data?.unitIdentifier })}>
                            <AddLease
                                open={showLeaseModal}
                                onOpenChange={() => setShowLeaseModal(!showLeaseModal)}
                                unit={data?.data}
                            >
                                <Button className="self-end justify-end" variant="outline" type="button">
                                    <FilePlus2 className="w-4 h-4 mr-2"/>
                                    {t('rentalDetail.addLease')}
                                </Button>
                            </AddLease>
                        </LeaseHistory>
                    </div>
                </TabsContent>

                <TabsContent value="maintenance">
                <MaintenanceTable
                        maintenanceReports={maintenanceReports}
                        subtitle={t('rentalDetail.maintenanceSubtitle')}
                    />
                </TabsContent>

                <TabsContent value="expenses">
                    <ExpensesTable
                        expenses={expenses}
                        subtitle={t('rentalDetail.expensesSubtitle')}
                    />
                </TabsContent>
            </Tabs>

        </>
    )


}

export default RentalDetail;