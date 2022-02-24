# This is needed to remove \r line endings that keep popping up.
sed -i 's/\r$//' db.env
source db.env
echo "exporting complete."