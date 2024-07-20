echo "Building app..."
npm run build

echo "Deploy files to server..."
scp -r -i ~/Desktop/forbad_system build/* root@167.99.67.127:/var/www/html/
echo "Done!"