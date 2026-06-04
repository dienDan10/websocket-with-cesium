import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createConnectionSlice } from './slices/connectionSlice';
import { createUiSlice } from './slices/uiSlice';
import { createCampaignSlice } from './slices/campaignSlice';

export const useStore = create(
    immer((...args) => ({
        ...createConnectionSlice(...args),
        ...createUiSlice(...args),
        ...createCampaignSlice(...args),
    })),
);
