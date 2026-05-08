plugins {
    kotlin("jvm") version "1.9.22"
    `java-library`
    `maven-publish`
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
    repositories {
        maven {
            name = "ossrh"
            val releasesUrl = uri("https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/")
            val snapshotsUrl = uri("https://s01.oss.sonatype.org/content/repositories/snapshots/")
            url = if (version.toString().endsWith("SNAPSHOT")) snapshotsUrl else releasesUrl
            credentials {
                username = findProperty("ossrhUsername") as String? ?: System.getenv("OSSRH_USERNAME") ?: ""
                password = findProperty("ossrhPassword") as String? ?: System.getenv("OSSRH_PASSWORD") ?: ""
            }
        }
    }
}
