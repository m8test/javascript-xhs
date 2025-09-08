import java.util.*

plugins {
    `java-library`
    `maven-publish`
}

val props = Properties().apply {
    File(rootDir.parentFile, "gradle.properties").inputStream().use { p0 -> load(p0) }
}

val m8testGradleVersion = props.getProperty("m8testGradleVersion")
dependencies {
    dependencies {
        implementation("com.m8test:gradle-plugin:$m8testGradleVersion")
    }
}

repositories {
    mavenCentral()
    google()
    gradlePluginPortal()
    maven {
        url =
            uri("https://raw.githubusercontent.com/m8test/development-environment/refs/heads/v${m8testGradleVersion}/")
    }
}
