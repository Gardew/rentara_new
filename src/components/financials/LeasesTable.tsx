import {
    ColumnDef,
} from "@tanstack/react-table";
import {Checkbox} from "../ui/checkbox.tsx";
import {dateParser, moneyParser} from "../../utils/formatters.js";
import {DataTable} from "../ui/data-table.js";
import {Lease, RentPayment} from "../../utils/classes.ts";
import {Eye, MoreHorizontal, Pencil, Scroll, Trash2} from "lucide-react";
import {LeaseStatusBadge} from "../../utils/statusBadges.js";
import {LeaseStatus} from "../../utils/magicNumbers.js";
import Link from "../general/Link.tsx";
import {useMemo, useState} from "react";
import {useDeleteLeaseMutation} from "../../services/api/leaseApi";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "../ui/dropdown-menu.tsx";
import EditLease from "../leases/EditLease";
import DeleteDialog from "../general/DeleteDialog";
import {useDeleteLeasesMutation, useUpdateLeasesMutation} from "../../services/api/bulkApi";
import {Button} from "../ui/button.tsx";
import ViewLease from "../leases/ViewLease.js";
import {isWithinInterval, subDays} from "date-fns";
import {ButtonGroup, ButtonGroupItem} from "../ui/button-group.tsx";
import { useTranslation } from 'react-i18next';


const LeaseActions = ({lease}) => {
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)

    const [deleteLease] = useDeleteLeaseMutation();

    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <EditLease lease={lease} open={editModalOpen} setIsOpen={setEditModalOpen} />

            <DeleteDialog
                open={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                title={t('leases.table.deleteLease')}
                content={t('leases.table.deleteLeaseConfirm')}
                onConfirm={() => deleteLease(lease?.id)}
            />

            {viewModalOpen && <ViewLease lease={lease} open={viewModalOpen} setOpen={setViewModalOpen} />}

            <DropdownMenuTrigger asChild className="cursor-pointer">
                <MoreHorizontal className="h-5 w-5 ml-3"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuItem className="flex flex-row text-sm gap-2" onClick={() => setViewModalOpen(true)}>
                        <Eye className="w-4 h-4"/>
                        {t('leases.table.view')}
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                        <Pencil className="w-4 h-4 mr-2"/>
                        {t('leases.table.edit')}
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator/>

                <DropdownMenuGroup>
                    <DropdownMenuItem className="flex flex-row text-sm text-red-500"
                                      onClick={() => setDeleteModalOpen(true)}
                    >
                        <Trash2 className="w-4 h-4 mr-2"/>
                        {t('leases.table.deleteLease')}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>

    )
}


const columns: ColumnDef<Lease>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                // @ts-expect-error - TS doesn't understand that we're using a custom accessor
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "lease",
        header: "Lease",
        cell: ({ row }) => (
            <div className="capitalize">#{row?.original?.id}</div>
        ),
        meta: {
            type: "number",
        },
        accessorFn: (row) => row?.id || "",
        enableSorting: true,
    },
    {
        id: "tenant",
        header: "Tenant",
        cell: ({ row }) => {
            if (row?.original?.tenantId) {
                return (
                    <Link id={row.original.tenantId} type={"tenant"} />
                )
            }
            else {
                return (
                    <div className="capitalize text-red-600/90 font-500">No Tenant</div>
                )
            }
        },
        accessorFn: (row) => (row?.tenant?.firstName + " " + row?.tenant?.lastName) || "",
        meta: {
            type: "string",
        },
        enableSorting: true,
    },
    {
        id: "startDate",
        header: "Start Date",
        meta: {
            type: "date",
        },
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {dateParser(row?.original?.startDate)}
                </div>
            )
        },
        accessorFn: (row) => row?.startDate || "",
        enableSorting: true,

    },
    {
        id: "endDate",
        header: "End Date",
        meta: {
            type: "date",
        },
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {dateParser(row?.original?.endDate)}
                </div>
            )
        },
        accessorFn: (row) => row?.endDate || "",
        enableSorting: true,
    },
    {
        id: "rentalPrice",
        header: "Rental Price",
        meta: {
            type: "string",
        },
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {moneyParser(row?.original?.rentalPrice)}
                </div>
            )
        },
        accessorFn: (row) => row?.rentalPrice || "",
        enableSorting: true,
    },
    {
        id: "unit",
        header: "Unit",
        cell: ({ row }) => {
            if (row?.original?.unitId) {
                return (
                    <Link id={row.original.unitId} type={"unit"}  />
                )
            }
            else {
                return (
                    <div className="capitalize text-red-500">No Unit</div>
                )
            }
        },
        accessorFn: (row) => row?.unit?.unitIdentifier || "",
        meta: {
            type: "string",
        },
        enableSorting: true,
    },
    {
        id: "status",
        header: "Status",
        meta: {
            type: "enum",
            options: Object.values(LeaseStatus)
        },
        cell: ({ row }) => {
            return (
                <LeaseStatusBadge status={row?.original?.status} />
            )
        },
        accessorFn: (row) => row?.status || undefined,
        enableSorting: true,
    },
    {
        id: "paymentFrequency",
        header: "Payment Frequency",
        meta: {
            type: "string",
        },
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {row?.original?.paymentFrequency?.toLowerCase()}
                </div>
            )
        },
        accessorFn: (row) => row?.paymentFrequency || "",
        enableSorting: true,
    },
    {
        id: "notes",
        header: "Notes",
        meta: {
            type: "string",
        },
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {row?.original?.notes}
                </div>
            )
        },
        accessorFn: (row) => row?.notes || "",
        enableSorting: true,
    },
    {
        id: "specialTerms",
        header: "Special Terms",
        meta: {
            type: "string",
        },
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {row?.original?.specialTerms}
                </div>
            )
        },
        accessorFn: (row) => row?.specialTerms || "",
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
            const lease = row.original
            return (
                <LeaseActions lease={lease}/>
            )
        },
    },
]

const LeaseBulkActions = ({selectedRows}) => {

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    const [updateLeases] = useUpdateLeasesMutation();
    const [deleteLeases] = useDeleteLeasesMutation();

    const { t } = useTranslation();

    if (selectedRows.length === 0) {
        return null
    }


    const handleDeleteLeases = () => {
        deleteLeases(selectedRows)
    }

    const handleStatusChange = (status: string) => {
        const body = selectedRows.map((row) => {
            return {
                id: row.id,
                status: status
            }
        })

        updateLeases(body);
    }

    return (
        <DropdownMenu>
            <DeleteDialog
                open={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                title={t('leases.table.deleteLeases')}
                content={t('leases.table.deleteLeasesConfirm', { count: selectedRows?.length })}
                onConfirm={handleDeleteLeases}
            />

            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Pencil className="w-4 h-4 mr-2"/> {t('leases.table.selectedCount', { count: selectedRows?.length })}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            {t('leases.table.setStatus')}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {Object.keys(LeaseStatus).map((status) => (
                                <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                                    {LeaseStatus[status]}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuGroup>

                <DropdownMenuSeparator/>

                <DropdownMenuGroup>
                    <DropdownMenuItem className="flex flex-row text-sm text-red-500"
                                      onClick={() => setDeleteModalOpen(true)}
                    >
                        <Trash2 className="w-4 h-4 mr-2"/>
                        {t('leases.table.delete')}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )

}


const LeasesTable = ({ leases }) => {

    const [selectedRows, setSelectedRows] = useState<Lease[]>([])

    const [selectedFilter, setSelectedFilter] = useState("active")

    const filteredLeases = useMemo(() => {
        if (selectedFilter === "all") return leases
        if (selectedFilter === "active") {
            return leases?.filter((lease: Lease) => lease.status === "ACTIVE")
        }
        if (selectedFilter === "inactive") {
            return leases?.filter((lease: Lease) => lease.status !== "ACTIVE")
        }

    }, [selectedFilter, leases])

    const { t } = useTranslation();

    const columnsLocal: ColumnDef<Lease>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    // @ts-expect-error - our Checkbox supports indeterminate via a tri-state prop
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "lease",
            header: t('leases.table.lease'),
            cell: ({ row }) => (
                <div className="capitalize">#{row?.original?.id}</div>
            ),
            meta: {
                type: "number",
            },
            accessorFn: (row) => row?.id || "",
            enableSorting: true,
        },
        {
            id: "tenant",
            header: t('leases.table.tenant'),
            cell: ({ row }) => {
                if (row?.original?.tenantId) {
                    return (
                        <Link id={row.original.tenantId} type={"tenant"} />
                    )
                }
                else {
                    return (
                        <div className="capitalize text-red-600/90 font-500">{t('leases.table.noTenant')}</div>
                    )
                }
            },
            accessorFn: (row) => (row?.tenant?.firstName + " " + row?.tenant?.lastName) || "",
            meta: {
                type: "string",
            },
            enableSorting: true,
        },
        {
            id: "startDate",
            header: t('leases.table.startDate'),
            meta: {
                type: "date",
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize">
                        {dateParser(row?.original?.startDate)}
                    </div>
                )
            },
            accessorFn: (row) => row?.startDate || "",
            enableSorting: true,
        },
        {
            id: "endDate",
            header: t('leases.table.endDate'),
            meta: {
                type: "date",
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize">
                        {dateParser(row?.original?.endDate)}
                    </div>
                )
            },
            accessorFn: (row) => row?.endDate || "",
            enableSorting: true,
        },
        {
            id: "rentalPrice",
            header: t('leases.table.rentalPrice'),
            meta: {
                type: "string",
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize">
                        {moneyParser(row?.original?.rentalPrice)}
                    </div>
                )
            },
            accessorFn: (row) => row?.rentalPrice || "",
            enableSorting: true,
        },
        {
            id: "unit",
            header: t('leases.table.unit'),
            cell: ({ row }) => {
                if (row?.original?.unitId) {
                    return (
                        <Link id={row.original.unitId} type={"unit"}  />
                    )
                }
                else {
                    return (
                        <div className="capitalize text-red-500">{t('leases.table.noUnit')}</div>
                    )
                }
            },
            accessorFn: (row) => row?.unit?.unitIdentifier || "",
            meta: {
                type: "string",
            },
            enableSorting: true,
        },
        {
            id: "status",
            header: t('leases.table.status'),
            meta: {
                type: "enum",
                options: Object.values(LeaseStatus)
            },
            cell: ({ row }) => {
                return (
                    <LeaseStatusBadge status={row?.original?.status} />
                )
            },
            accessorFn: (row) => row?.status || undefined,
            enableSorting: true,
        },
        {
            id: "paymentFrequency",
            header: t('leases.table.paymentFrequency'),
            meta: {
                type: "string",
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize">
                        {row?.original?.paymentFrequency?.toLowerCase()}
                    </div>
                )
            },
            accessorFn: (row) => row?.paymentFrequency || "",
            enableSorting: true,
        },
        {
            id: "notes",
            header: t('leases.table.notes'),
            meta: {
                type: "string",
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize">
                        {row?.original?.notes}
                    </div>
                )
            },
            accessorFn: (row) => row?.notes || "",
            enableSorting: true,
        },
        {
            id: "specialTerms",
            header: t('leases.table.specialTerms'),
            meta: {
                type: "string",
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize">
                        {row?.original?.specialTerms}
                    </div>
                )
            },
            accessorFn: (row) => row?.specialTerms || "",
            enableSorting: true,
        },
        {
            id: "actions",
            header: t('leases.table.actions'),
            enableHiding: false,
            cell: ({ row }) => {
                const lease = row.original
                return (
                    <LeaseActions lease={lease}/>
                )
            },
        },
    ]


    return (
        <div className={"border-2 border-border p-4 rounded-lg "}>

            <DataTable
                data={filteredLeases}
                columns={columnsLocal}
                title={t('financials.tabs.leases')}
                subtitle={t('financials.leasesSubtitle')}
                icon={<Scroll className={"w-5 h-5"} />}
                defaultSort={{id: "lease", desc: true}}
                onRowSelectionChange={(selectedRows: Lease[]) => setSelectedRows(selectedRows)}
            >

                <ButtonGroup
                    value={selectedFilter}
                    onValueChange={(value) => setSelectedFilter(value)}
                >
                    <ButtonGroupItem value={"all"} >
                        {t('financials.filters.viewAll')}
                    </ButtonGroupItem>
                    <ButtonGroupItem value={"active"}>
                        {t('financials.filters.active')}
                    </ButtonGroupItem>
                    <ButtonGroupItem value={"inactive"}>
                        {t('financials.filters.inactive')}
                    </ButtonGroupItem>
                </ButtonGroup>

                <LeaseBulkActions selectedRows={selectedRows}/>

            </DataTable>

        </div>

    )
}

export default LeasesTable;