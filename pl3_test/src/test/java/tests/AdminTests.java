package tests;

import org.openqa.selenium.Alert;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.AdminPage;
import pages.LoginPage;

import java.time.Duration;

public class AdminTests {

    WebDriver driver;
    AdminPage adminPage;
    LoginPage loginPage;

    @BeforeMethod
    public void setUp() {
        driver = new ChromeDriver();
        driver.get("http://localhost:8080/");
        adminPage = new AdminPage(driver);
        loginPage = new LoginPage(driver);
    }

    @Test(priority = 1)
    public void studentEditPanel() {
        loginPage.enterUserName("admin");
        loginPage.enterPassword("admin123");
        loginPage.clickLogin();
        adminPage.clickEditButton();
        adminPage.enterStudentName("name");
        adminPage.enterStudentAge("21");
        adminPage.enterStudentClass("CS101");
        adminPage.enterStudentGrade("16");
        adminPage.clickUpdateStudentButton();
        try {
            String message = adminPage.getToastMessage();
            System.out.println("Toast says: " + message);
            Assert.assertEquals(message, "Student name updated successfully");
        } catch (TimeoutException e) {
            System.out.println("Toast did not appear");
            Assert.fail("Toast message did not appear after updating student");
        }


    }

    @Test(priority = 2)
    public void editWithInvalidAgePanel() {
        loginPage.enterUserName("admin");
        loginPage.enterPassword("admin123");
        loginPage.clickLogin();
        adminPage.clickEditButton();
        adminPage.enterStudentName("name");
        adminPage.enterStudentAge("-8");
        adminPage.enterStudentClass("CS101");
        adminPage.enterStudentGrade("16"); // Update separated by comma
        adminPage.clickUpdateStudentButton();
        try {
            String message = adminPage.getToastMessage();
            System.out.println("Toast says: " + message);
            Assert.assertEquals(message, "Invalid Age");
        } catch (TimeoutException e) {
            System.out.println("Toast did not appear");
            Assert.fail("Toast message did not appear after updating student");
        }
    }




    @AfterMethod
    public void tearDown() {
        driver.quit();
    }

}