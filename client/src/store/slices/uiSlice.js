export const createUiSlice = (set) => ({
    ui: {
        selectedEntityId: null,
        isPanelOpen: false,
    },
    selectEntity: (id) =>
        set((state) => {
            state.ui.selectedEntityId = id;
        }),
    togglePanel: (open) =>
        set((state) => {
            state.ui.isPanelOpen = open;
        }),
});
