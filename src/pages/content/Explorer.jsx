import StreetMap from "../../components/explorer/StreetMap.js";
import {useState} from "react";
import { useTranslation } from 'react-i18next';

const Explorer = () => {
    const [selectedUnit, setSelectedUnit] = useState(null)
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('explorer.title')}</h1>
            <div className="flex flex-row justify-between gap-6 flex-wrap">
                <StreetMap selected={selectedUnit} onSelect={setSelectedUnit}/>
                <div className="basis-32 flex-grow p-2 border border-border min-w-fit shadow-md rounded-lg text-muted-foreground" hidden={!selectedUnit}>
                    <h2 className="whitespace-nowrap text-foreground">
                        {t('explorer.unitDetails')}
                    </h2>
                    <p>{t('explorer.unit')} {selectedUnit?.unitIdentifier || selectedUnit?.id}</p>

                    <p>
                        {t('explorer.floor')} {selectedUnit?.floor ?? t('explorer.na')}
                    </p>

                    <p>
                        {t('explorer.rooms')} {selectedUnit?.numOfRooms || t('explorer.na')}
                    </p>

                </div>

            </div>

        </div>
    )
}

export default Explorer;