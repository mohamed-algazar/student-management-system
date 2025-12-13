package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;


public class LoginPage {

    WebDriver driver;

    // Constructor
    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }

    // Locators
    By usernameInput = By.xpath("//input[@placeholder='Username']");
    By passwordInput = By.xpath("//input[@placeholder='Password']");
    By loginButton = By.xpath("//button[normalize-space()='Login']");




    // Actions (Methods)
    public void enterUserName(String name) {
        driver.findElement(usernameInput).sendKeys(name);
    }

    public void enterPassword(String pass) {
        driver.findElement(passwordInput).sendKeys(pass);
    }

    public void clickLogin() {
        driver.findElement(loginButton).click();
    }

}