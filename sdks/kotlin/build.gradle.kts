plugins {
    kotlin("jvm") version "2.3.21"
    `java-library`
    `maven-publish`
    signing
    id("io.github.gradle-nexus.publish-plugin") version "2.0.0"
}

group = "io.github.servetarslan02"
version = "0.3.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.google.code.gson:gson:2.14.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.squareup.moshi:moshi:1.15.2")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.2")
    implementation("com.squareup.moshi:moshi-adapters:1.15.2")
    implementation("javax.annotation:javax.annotation-api:1.3.2")
    implementation("io.gsonfire:gson-fire:1.9.0")
    implementation("org.openapitools:jackson-databind-nullable:0.2.6")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.19.0")
    implementation("com.google.code.findbugs:jsr305:3.0.2")

    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.12.2")
    testImplementation("io.kotlintest:kotlintest-runner-junit5:3.4.2")
}

tasks.test {
    useJUnitPlatform()
}

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
    withSourcesJar()
    withJavadocJar()
}

kotlin {
    jvmToolchain(21)
}

publishing {
    publications {
        create<MavenPublication>("maven") {
            from(components["java"])
            groupId = "io.github.servetarslan02"
            artifactId = "hooksniff-sdk-kotlin"
            version = "0.3.0"

            pom {
                name.set("HookSniff Kotlin SDK")
                description.set("Official Kotlin client for HookSniff webhook delivery service")
                url.set("https://github.com/servetarslan02/HookSniff")
                licenses {
                    license {
                        name.set("MIT License")
                        url.set("https://opensource.org/licenses/MIT")
                    }
                }
                developers {
                    developer {
                        name.set("Servet Arslan")
                        email.set("support@hooksniff.dev")
                        url.set("https://github.com/servetarslan02")
                    }
                }
                scm {
                    connection.set("scm:git:git://github.com/servetarslan02/HookSniff.git")
                    developerConnection.set("scm:git:ssh://github.com:servetarslan02/HookSniff.git")
                    url.set("https://github.com/servetarslan02/HookSniff")
                }
            }
        }
    }
}

signing {
    useGpgCmd()
    sign(publishing.publications["maven"])
}

nexusPublishing {
    repositories {
        sonatype {
            nexusUrl.set(uri("https://ossrh-staging-api.central.sonatype.com/service/local/"))
            snapshotRepositoryUrl.set(uri("https://central.sonatype.com/repository/maven-snapshots/"))
        }
    }
}
