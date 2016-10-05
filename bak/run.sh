rm -rf ./target
mkdir ./target
javac -d ./target -cp ./src:./lib/* ./src/sg/edu/nus/comp/idat/Server.java
java -cp ./target:./lib/* sg.edu.nus.comp.idat.Server

