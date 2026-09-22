package com.example.weather;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

import static org.junit.jupiter.api.Assertions.assertTrue;

class WeatherAppTest {

    @Test
    void weatherPageLoads() {
        WebDriver driver = new ChromeDriver();
        try {
            driver.get("http://localhost:8081");
            assertTrue(driver.getTitle().contains("Weather App"));
            assertTrue(driver.findElement(By.id("cityInput")).isDisplayed());
        } finally {
            driver.quit();
        }
    }

    @Test
    void emptyCityShowsValidationMessage() {
        WebDriver driver = new ChromeDriver();
        try {
            driver.get("http://localhost:8081");
            driver.findElement(By.id("searchBtn")).click();
            assertTrue(driver.findElement(By.id("message"))
                    .getText().contains("Please enter a city name"));
        } finally {
            driver.quit();
        }
    }
}
