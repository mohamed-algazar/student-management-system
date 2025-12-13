package tests;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import pages.LoginPage;

public class LoginTest {

    WebDriver driver;
    LoginPage loginPage;

    @BeforeMethod
    public void setUp() {
        driver = new ChromeDriver();
        driver.get("http://localhost:8080/");
        loginPage = new LoginPage(driver);
    }

    public  void loginPanel(){
        loginPage.enterUserName("admin");
        loginPage.enterPassword("admin123");
        loginPage.clickLogin();
    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }

}