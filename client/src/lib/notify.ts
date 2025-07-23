import { toast } from "sonner";

const notify = {
  success: (message: string, id?: string | number) => {
    toast.success(message, { id });
  },
  error: (message: string, id?: string | number) => {
    toast.error(message, { id });
  },
  info: (message: string, id?: string | number) => {
    toast.info(message, { id });
  },
  loading: (message: string, id?: string | number) => {
    return toast.loading(message, { id });
  },
  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },
};

export default notify;
