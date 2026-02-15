import { useContext } from 'react';
import { DisciplineContext } from '../context/DisciplineContext';

export const useDiscipline = () => {
    const context = useContext(DisciplineContext);
    if (!context) {
        throw new Error('useDiscipline must be used within a DisciplineProvider');
    }
    return context;
};
