sudo apt update
sudo apt install snapd
# sudo snap install core
sudo snap install microk8s --classic --channel=1.21

sudo usermod -a -G microk8s $USER
sudo chown -f -R $USER ~/.kube
# logout/login

# add /snap/bin/ to $PATH
# alias kubectl='microk8s kubectl'

# Master node
# sudo vim /var/snap/microk8s/current/args/containerd-template.toml
# add
# [plugins."io.containerd.grpc.v1.cri".registry.mirrors."registry.local:32000"]
#        endpoint = ["http://registry.local:32000"]
# /etc/hosts as well

microk8s enable registry
microk8s enable dns
