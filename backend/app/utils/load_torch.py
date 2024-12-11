import torch

# Set random seed for reproducibility
torch.manual_seed(0)
device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

if torch.backends.cudnn.enabled or torch.backends.cudnn.is_available():
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
     
def get_device():
    return device   

def get_dtype():
    return torch_dtype