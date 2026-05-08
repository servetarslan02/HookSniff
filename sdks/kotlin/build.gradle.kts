plugins {
    kotlin("jvm") version "1.9.22"
    `java-library`
    `maven-publish`
    signing
}

group = "io.github.servetarslan02"
version = "0.2.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.google.code.gson:gson:2.10.1")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    testImplementation(kotlin("test"))
    testImplementation("junit:junit:4.13.2")
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
            artifactId = "hooksniff"
            version = "0.2.0"

            pom {
                name.set("HookSniff Kotlin SDK")
                description.set("Official Kotlin client for HookSniff webhook delivery service")
                url.set("https://github.com/servetarslan02/hooksniff-kotlin")
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
                    }
                }
                scm {
                    connection.set("scm:git:git://github.com/servetarslan02/hooksniff-kotlin.git")
                    developerConnection.set("scm:git:ssh://github.com:servetarslan02/hooksniff-kotlin.git")
                    url.set("https://github.com/servetarslan02/hooksniff-kotlin")
                }
            }
        }
    }
    repositories {
        maven {
            name = "central"
            url = uri("https://central.sonatype.com/api/v1/publisher")
            credentials {
                username = findProperty("ossrhUsername") as String? ?: System.getenv("OSSRH_USERNAME") ?: ""
                password = findProperty("ossrhPassword") as String? ?: System.getenv("OSSRH_PASSWORD") ?: ""
            }
        }
    }
}

signing {
    val signingKeyId = findProperty("signing.keyId") as String? ?: System.getenv("SIGNING_KEY_ID") ?: ""
    val signingKey = findProperty("signing.key") as String? ?: System.getenv("SIGNING_KEY") ?: ""
    val signingPassword = findProperty("signing.password") as String? ?: System.getenv("SIGNING_PASSWORD") ?: ""

    if (signingKeyId.isNotEmpty()) {
        useInMemoryPgpKeys(signingKeyId, signingKey, signingPassword)
    }

    sign(publishing.publications["maven"])
}
