import ToastEventBus from 'primevue/toasteventbus';

export const useToastService = () => {
  const showToast = ({
    severity = 'success',
    detail,
    life = 3000,
    summary = 'Success',
  }) => {
    ToastEventBus.emit('add', { severity, detail, life, summary });
  };

  return { showToast };
};
