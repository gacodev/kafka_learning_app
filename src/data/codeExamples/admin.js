export const adminExamples = {
  categories: {
    'Configuración': {
      description: 'Ejemplos de configuración y administración de Kafka',
      subcategories: {
        'Configuración de Broker': {
          description: 'Configuraciones esenciales del broker Kafka',
          examples: {
            properties: {
              language: 'Properties',
              code: `# Configuraciones básicas del broker
broker.id=0
listeners=PLAINTEXT://localhost:9092
advertised.listeners=PLAINTEXT://localhost:9092
num.network.threads=3
num.io.threads=8
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600

# Configuraciones de log
log.dirs=/var/lib/kafka/data
num.partitions=3
num.recovery.threads.per.data.dir=1
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000

# Configuraciones de ZooKeeper
zookeeper.connect=localhost:2181
zookeeper.connection.timeout.ms=18000`,
              explanation: 'Configuraciones básicas del servidor Kafka en server.properties'
            },
            bash: {
              language: 'Bash',
              code: `# Iniciar el servidor Kafka
bin/kafka-server-start.sh config/server.properties

# Iniciar en modo daemon
bin/kafka-server-start.sh -daemon config/server.properties

# Detener el servidor
bin/kafka-server-stop.sh`,
              explanation: 'Comandos para iniciar y detener el servidor Kafka'
            }
          }
        },
        'Gestión de Topics': {
          description: 'Administración y configuración de topics',
          examples: {
            bash: {
              language: 'Bash',
              code: `# Crear un topic
kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic my-topic \
  --partitions 3 \
  --replication-factor 2

# Listar todos los topics
kafka-topics.sh --list \
  --bootstrap-server localhost:9092

# Describir un topic
kafka-topics.sh --describe \
  --bootstrap-server localhost:9092 \
  --topic my-topic

# Modificar particiones
kafka-topics.sh --alter \
  --bootstrap-server localhost:9092 \
  --topic my-topic \
  --partitions 6

# Eliminar un topic
kafka-topics.sh --delete \
  --bootstrap-server localhost:9092 \
  --topic my-topic`,
              explanation: 'Comandos para la gestión completa de topics'
            },
            properties: {
              language: 'Properties',
              code: `# Configuraciones por defecto para nuevos topics
num.partitions=3
default.replication.factor=2

# Configuraciones de retención
log.retention.hours=168
log.retention.bytes=1073741824
log.segment.bytes=1073741824

# Configuraciones de compactación
log.cleanup.policy=delete
log.cleaner.enable=true
log.cleaner.min.cleanable.ratio=0.5
log.cleaner.threads=1
log.cleaner.dedupe.buffer.size=134217728`,
              explanation: 'Configuraciones de topics en server.properties'
            }
          }
        },
        'Seguridad': {
          description: 'Configuración de seguridad y ACLs',
          examples: {
            properties: {
              language: 'Properties',
              code: `# Configuración SSL
ssl.keystore.location=/var/private/ssl/kafka.server.keystore.jks
ssl.keystore.password=test1234
ssl.key.password=test1234
ssl.truststore.location=/var/private/ssl/kafka.server.truststore.jks
ssl.truststore.password=test1234
ssl.client.auth=required
security.inter.broker.protocol=SSL

# Configuración SASL
sasl.enabled.mechanisms=PLAIN,SCRAM-SHA-256,SCRAM-SHA-512
sasl.mechanism.inter.broker.protocol=PLAIN
security.inter.broker.protocol=SASL_SSL

# Configuración de autorización
authorizer.class.name=kafka.security.authorizer.AclAuthorizer
super.users=User:admin`,
              explanation: 'Configuraciones de seguridad en server.properties'
            },
            bash: {
              language: 'Bash',
              code: `# Crear ACLs
kafka-acls.sh --bootstrap-server localhost:9092 \
  --command-config admin.properties \
  --add \
  --allow-principal User:Bob \
  --operation Read \
  --operation Describe \
  --topic my-topic \
  --group my-group

# Listar ACLs
kafka-acls.sh --bootstrap-server localhost:9092 \
  --command-config admin.properties \
  --list

# Crear usuario SCRAM
kafka-configs.sh --bootstrap-server localhost:9092 \
  --command-config admin.properties \
  --alter \
  --add-config 'SCRAM-SHA-256=[password=user-secret]' \
  --entity-type users \
  --entity-name user1

# Generar certificado SSL
keytool -keystore kafka.server.keystore.jks \
  -alias localhost \
  -validity 365 \
  -genkey \
  -keyalg RSA \
  -storepass test1234 \
  -keypass test1234 \
  -dname "CN=localhost, OU=IT, O=Company, L=City, S=State, C=US"`,
              explanation: 'Comandos para configurar seguridad y ACLs'
            }
          }
        },
        'Monitoreo y Mantenimiento': {
          description: 'Herramientas y comandos para monitoreo',
          examples: {
            bash: {
              language: 'Bash',
              code: `# Verificar estado de consumidores
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --describe --group my-group

# Monitorear lag de consumidores
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --describe --group my-group \
  --members --verbose

# Verificar estado de replicación
kafka-topics.sh --describe \
  --bootstrap-server localhost:9092 \
  --under-replicated-partitions

# Verificar logs
kafka-log-dirs.sh --bootstrap-server localhost:9092 \
  --describe --topic-list my-topic

# Ejecutar rebalanceo de líderes preferidos
kafka-leader-election.sh --bootstrap-server localhost:9092 \
  --election-type PREFERRED \
  --all-topic-partitions`,
              explanation: 'Comandos para monitoreo y mantenimiento'
            },
            properties: {
              language: 'Properties',
              code: `# Configuraciones de métricas JMX
kafka.metrics.polling.interval.secs=10
kafka.metrics.reporters=kafka.metrics.reporter.JmxReporter
kafka.metrics.jmx.prefix=kafka.server

# Configuraciones de logs de depuración
log4j.logger.kafka=INFO
log4j.logger.kafka.network.RequestChannel$=WARN
log4j.logger.kafka.producer.async.DefaultEventHandler=DEBUG
log4j.logger.kafka.request.logger=WARN
log4j.logger.kafka.controller=TRACE
log4j.logger.state.change.logger=TRACE`,
              explanation: 'Configuraciones para monitoreo y logging'
            }
          }
        }
      }
    }
  }
}; 