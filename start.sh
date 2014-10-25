cd /tmp
# try to remove the repo if it already exists
rm -rf aka-skrapa; true
git clone https://github.com/14H-G1/aka-skrapa.git
cd aka-skrapa
npm update
node get 7780834 50
