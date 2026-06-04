export const createCampaignSlice = (set) => ({
    campaign: {
        id: null,
        name: null,
        factions: {}, // { [id]: { name, color } }
        unitTypes: {}, // { [id]: { name } }
    },
    setCampaign: (data) =>
        set((state) => {
            state.campaign = { ...state.campaign, ...data };
        }),
});
