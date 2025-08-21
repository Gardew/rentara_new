import {ColumnDef} from "@tanstack/react-table";
import {Tenant} from "../../utils/classes.ts";
import {Checkbox} from "../ui/checkbox.tsx";
import {dateParser} from "../../utils/formatters.js";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu.tsx";
import {Button} from "../ui/button.tsx";
import {MoreHorizontal, Pencil, Send, Trash2, UserRound} from "lucide-react";
import {DataTable} from "../ui/data-table.js";
import {Avatar, AvatarFallback} from "../ui/avatar.tsx";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {selectUnitsByLeaseIds, selectUnitsByTenantId} from "../../services/slices/objectSlice.js";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "../ui/tooltip.tsx";
import {Badge} from "../ui/badge.tsx";
import {useDeleteTenantMutation} from "../../services/api/tenantApi.js";
import {isAfter, isBefore} from "date-fns";
import Link from "../general/Link.tsx";
import DeleteDialog from "../general/DeleteDialog";
import {useState} from "react";
import { useTranslation } from 'react-i18next';


const TenantTable = ({tenants}) => {
    const navigate = useNavigate();

    const [deleteTenant, {isLoading: isDeletingTenant}] = useDeleteTenantMutation()

    const { t } = useTranslation();


    // True if the user has an active lease (end date is after today or no end date at all)
    const getActiveLeases = (leases) => {
        return leases.filter(lease => lease.status === "ACTIVE")
    }

    const TenantOptions = ({tenant}) => {
        const [deleteModalOpen, setDeleteModalOpen] = useState(false)


        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                    <MoreHorizontal className="h-5 w-5 ml-3"/>
                </DropdownMenuTrigger>

                <DeleteDialog
                    open={deleteModalOpen}
                    setOpen={setDeleteModalOpen}
                    title={t('tenants.table.deleteTenant')}
                    content={t('tenants.table.deleteConfirm')}
                    onConfirm={() => deleteTenant(tenant?.id)}
                />

                <DropdownMenuContent className="w-[150px]">
                    <DropdownMenuGroup>
                        <DropdownMenuItem className="flex flex-row text-sm gap-2" onClick={() => navigate(`/tenants/${tenant?.id}`)}>
                            <UserRound className="w-4 h-4 "/>
                            {t('tenants.table.viewProfile')}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuItem className="flex flex-row text-sm gap-2 text-red-500"
                                          onClick={() => setDeleteModalOpen(true)}
                        >
                            <Trash2 className="w-4 h-4"/>
                            {t('tenants.table.deleteTenant')}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                </DropdownMenuContent>
            </DropdownMenu>
        )
    }


    const columns: ColumnDef<Tenant>[] = [
        {
            id: "tenant",
            header: t('tenants.table.tenant'),
            enableSorting: false,
            cell: ({ row }) => {

                const tenant = row.original;

                return (
                    <div className="flex flex-row items-center gap-2">
                        <Avatar className="cursor-pointer hover:border-2 hover:border-primary" onClick={() => navigate("/tenants/" + tenant?.id)}>
                            <AvatarFallback>{tenant?.firstName[0]?.toUpperCase()}{tenant?.lastName[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <p className="font-500 text-md ">
                                {tenant?.firstName + " " + tenant?.lastName}
                            </p>
                            <p className="font-300 text-gray-500 text-sm">
                                {tenant?.email}
                            </p>
                        </div>
                    </div>
                )
            },
            meta: {
                type: "string"
            },
            accessorFn: (row) => row.firstName + " " + row?.lastName + " " + row?.email
        },
        {
            accessorKey: "leaseStatus",
            header: t('tenants.table.leaseStatus'),
            enableSorting: true,
            cell: ({ row }) => {
                const tenant = row.original;


                const getLeaseText = (lease) => {
                    if (lease?.endDate && isBefore(new Date(lease?.endDate), new Date())) {
                        return t('tenants.table.leaseEndedOn', { date: dateParser(lease?.endDate) })
                    }
                    else if (lease?.endDate) {
                        return t('tenants.table.leaseEndsOn', { date: dateParser(lease?.endDate) })
                    }
                    else {
                        return t('tenants.table.noLeaseEndDate')
                    }
                }

                let mostRecentLease;

                try {
                    mostRecentLease = tenant?.leases[0]
                }
                catch (e) {
                    mostRecentLease = null;
                }


                const activeLeases = getActiveLeases(tenant?.leases);

                return (
                    <div className="flex flex-row items-center gap-2">
                        <div className="flex flex-col">
                            <p className="font-400 text-md ">
                                {
                                    activeLeases.length ? t('tenants.table.activeLeases', { count: activeLeases.length }) : t('tenants.table.noActiveLease')
                                }
                            </p>
                            <p className="font-300 text-gray-500 text-sm">
                                {mostRecentLease ? getLeaseText(mostRecentLease) : t('tenants.table.noLease')}
                            </p>
                        </div>
                    </div>
                )
            },
            meta: {
                type: "string"
            },
            accessorFn: (row) => {
                const activeLeases = getActiveLeases(row?.leases);
                return activeLeases.length ? "Active" : "Inactive"
            }
        },
        {
            id: "currentUnit",
            header: t('tenants.table.currentUnit'),
            enableSorting: true,
            cell: ({ row }) => {
                const tenant = row.original;

                let mostRecentUnit;

                try {
                    mostRecentUnit = tenant?.unit[0]
                }
                catch (e) {
                    mostRecentUnit = null;
                }

                if (!mostRecentUnit) return (
                    <p className="font-300 text-md text-gray-500">
                        {t('tenants.table.noUnit')}
                    </p>
                )
                return (
                    <Link id={mostRecentUnit.id} type={"unit"}  />
                )

            },
            meta: {
                type: "string"
            },
            accessorFn: (row) => {
                // @ts-expect-error - We added this above by mapping the tenants
                return row.unit?.unitIdentifier || undefined
            }
        },
        {
            accessorKey: "user",
            header: t('tenants.table.user'),
            cell: ({ row }) => {
                return (
                    <div className="flex w-fit items-start flex-col gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Badge variant="negative" className="h-fit whitespace-nowrap" >
                                            {t('tenants.table.unverifiedTenant')}
                                        </Badge>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        {t('tenantProfile.invite.desc')}
                                        </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button variant="default" size="md">
                            <Send className="mr-2 w-3 h-3"/>
                            {t('tenants.table.contact')}
                        </Button>
                    </div>
                )
            },
            meta: {
                type: "string"
            },
            enableSorting: true,
            accessorFn: (row) => row.userId ? "Verified" : "Unverified"
        },
        {
            id: "createdAt",
            header: t('tenants.table.createdAt'),
            enableSorting: true,
            cell: ({ row }) => <div className="lowercase">{dateParser(row.getValue("createdAt"))}</div>,
            meta: {
                type: "date"
            },
            accessorFn: (row) => new Date(row.createdAt)
        },
        {
            id: "actions",
            header: t('tenants.table.actions'),
            enableHiding: false,
            cell: ({ row }) => {
                const tenant = row.original

                return (
                    <TenantOptions tenant={tenant}/>
                )
            },
        },
    ]


    return (
        <DataTable
            data={tenants}
            columns={columns}
            defaultSort={{id: "leaseStatus", desc: false}}
        />
    )
}

export default TenantTable;