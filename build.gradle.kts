// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    dependencies {
        val version = "0.1.11"
        val jarPath = File(System.getProperty("user.home"), ".m8test/jar/gradle/${version}.jar")
        if (!jarPath.exists()) {
            try {
                val url =
                    java.net.URL("https://github.com/m8test/development-environment/releases/download/$version/com.m8test.gradle.plugin-$version.jar")
                url.openStream().use { input -> java.nio.file.Files.copy(input, jarPath.toPath()) }
                println("Download gradle jar to  ${jarPath.canonicalPath} complete.")
            } catch (e: Exception) {
                throw GradleException("Required classpath jar not found: $jarPath")
            }
        }
        classpath(files(jarPath))
    }
}

plugins {
    alias(libs.plugins.kotlin) apply false
}

//apply(plugin = libs.plugins.m8test.groovy.get().pluginId)
//apply(plugin = libs.plugins.m8test.java.get().pluginId)
//apply(plugin = libs.plugins.m8test.javascript.get().pluginId)
//apply(plugin = libs.plugins.m8test.kotlin.get().pluginId)
//apply(plugin = libs.plugins.m8test.lua.get().pluginId)
//apply(plugin = libs.plugins.m8test.php.get().pluginId)
//apply(plugin = libs.plugins.m8test.python.get().pluginId)
//apply(plugin = libs.plugins.m8test.ruby.get().pluginId)