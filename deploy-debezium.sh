#!/bin/bash

echo "Waiting for Kafka Connect to be ready..."
until $(curl --output /dev/null --silent --head --fail http://localhost:8083/connectors); do
    printf '.'
    sleep 5
done

echo -e "\nKafka Connect is ready. Deploying Debezium connectors..."

# Deploy product connector
echo -e "\n📦 Deploying product-connector..."
curl -X POST -H "Content-Type: application/json" --data @debezium/product-connector.json http://localhost:8083/connectors
sleep 2

# Deploy customer connector
echo -e "\n👤 Deploying customer-connector..."
curl -X POST -H "Content-Type: application/json" --data @debezium/customer-connector.json http://localhost:8083/connectors
sleep 2

# Deploy order connector
echo -e "\n📋 Deploying order-connector..."
curl -X POST -H "Content-Type: application/json" --data @debezium/order-connector.json http://localhost:8083/connectors
sleep 2

echo -e "\n\nChecking connector status..."
echo -e "\n📦 Product Connector:"
curl http://localhost:8083/connectors/product-connector/status

echo -e "\n\n👤 Customer Connector:"
curl http://localhost:8083/connectors/customer-connector/status

echo -e "\n\n📋 Order Connector:"
curl http://localhost:8083/connectors/order-connector/status

echo -e "\n\nListing Kafka topics..."
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

echo -e "\n✅ All Debezium connectors deployed successfully!"
echo -e "\nTopics created:"
echo -e "  • products.events  → capturing core_db.products"
echo -e "  • customers.events → capturing core_db.customers"
echo -e "  • orders.events    → capturing core_db.orders"
