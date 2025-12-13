package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class AdminPage {

    WebDriver driver;
    WebDriverWait wait;

    // Constructor
    public AdminPage(WebDriver driver) {
        this.driver = driver;
        // إنشاء WebDriverWait لمدة 10 ثواني
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    // Locators
    By editButton = By.xpath("//button[normalize-space()='Edit']");
    By studentNameInput = By.xpath("//input[@placeholder='Student Name']");
    By ageInput = By.xpath("//input[@placeholder='Age']");
    By classInput = By.xpath("//input[@placeholder='Class (e.g., CS101)']");
    By gradesInput = By.xpath("(//input[@placeholder='Grades (comma-separated, e.g., 85.5, 92.0, 88.5)'])[1]");
    By updateStudentButton = By.xpath("//button[normalize-space()='Update Student']");


    By toastMessage = By.xpath("//p[contains(text(),'Student')]");

    // Actions (Methods)
    public void clickEditButton() {
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(editButton));
        button.click();
    }

    public void enterStudentName(String name) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(studentNameInput));
        input.clear();
        input.sendKeys(name);
    }

    public void enterStudentAge(String age) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(ageInput));
        input.clear();
        input.sendKeys(age);
    }

    public void enterStudentClass(String className) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(classInput));
        input.clear();
        input.sendKeys(className);
    }

    public void enterStudentGrade(String grade) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(gradesInput));
        input.clear();
        input.sendKeys(grade);
    }

    public void clickUpdateStudentButton() {
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(updateStudentButton));
        button.click();
    }

    public String getToastMessage() {
        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(toastMessage));
        return toast.getText();
    }
}
