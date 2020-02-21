export const APP_GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.plankton.circles"
export const APP_GET_CIRCLES_IN_URL = "getcircles.in"
export const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/circles-way.appspot.com/o/photos%2Flogo%2FCircles_Logo_SM_dark.png?alt=media&token=adf06bed-8326-411a-9c9e-ce338742860e"
export const WEBSITE_URL = "https://circlesway.com"

// Request parameter constants
export const PARAM_UPI = "upiID"
export const PARAM_PASSWORD = "password"
export const PARAM_FIREBASETOKEN = "fcmToken"
export const PARAM_PHONENUMBER = "phoneNumber"
export const PARAM_CARD = "CARD"
export const PARAM_CARDS = "CARDS"

// General
export const NONE = "None"
export const MAX_NUMBER_IN_CIRCLE = 10 
export const MAX_POST_LENGTH_SIZE = 140
export const MIN_POST_LENGTH_SIZE = 5
export const STORAGE_TOKEN_KEY = "CIRCLESTOKEN"
export const STORAGE_DEVICE_TOKEN_KEY = "FIREBASETOKEN"
export const FIREBASE_USER_ID = "FIREBASEUSERID"
export const STORAGE_FIRST_RUN = "ISFIRSTRUN"
export const STORAGE_PHONE_NUMBER = "PHONE"
export const STORAGE_USER_ID = "UID"
export const STORAGE_ENCRYPTION_ENABLED = "e2e"
export const DIAL_SCREEN_LINK_TEMPLATE = "tel:${%}"
export const SERVER_ENDPOINT =  "https://api.circlesway.com"  
// export const SERVER_ENDPOINT = "http://192.168.0.4:5000" 
export const DELAY_BEFORE_MANUAL_OTP = 9000 // milliseconds
export const LANDING_PAGE_BUTTON_DELAY = 3000
export const NOTIFICATION_POPUP_DELAY = 3000
export const MAX_RESEND_SMS_COUNT = 2

// Auth
export const AUTH_HEADER = "Authorization"
export const CONTENT_TYPE_HEADER = "Content-Type"
export const AUTH_HEADER_BASIC_PREFIX = "Basic "

// API Query Constants
export const GET_METHOD = "GET"
export const POST_METHOD = "POST"
export const APPLICATION_JSON = "application/json"
export const MIN_URL_LENGTH = 12
export const CONFLICT_ERROR_STATUS_CODE = 409
export const UNAUTHORIZED_STATUS_CODE = 401
export const TOKEN_EXPIRED_STATUS_CODE = 410
export const PRECONDITION_FAILED_STATUS_CODE = 412

// String Length
export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 40 // same on server
export const EMAIL_MIN_LENGTH = 8
export const EMAIL_MAX_LENGTH = 40
export const PHONE_NUMBER_MIN_LENGTH = 7
export const COUNTRY_CODE_MAX_LENGTH = 5
export const PHONE_NUMBER_MAX_LENGTH = 15
export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 15
export const REFERRAL_CODE_MAX_LENGTH = 4
export const NOTE_INPUT_MAX_LENGTH = 100
export const VERIFICATION_CODE_LENGTH = 5
export const AUTO_VERIFICATION_TIMEOUT = 10 // seconds
export const INVITE_CODE_MAX_LENGTH = 6
export const INVITE_CODE_MIN_LENGTH = 4
export const SHORT_DESCRIPTION_MAX_LENGTH = 50

export const FIREBASE_STORAGE_REF = "/uploads/users/profilePictures/"
export const APP_TITLE_SIZE = 30

// Colors
export const APP_THEME_COLORS = ['#0000B0', '#AF2BED'] // ['#1488cc', '#2b32b2'] 
export const CARDHOLDER_ACTION_BUTTON = ['#F5f5f5', '#ffffff'] // ['#1488cc', '#2b32b2'] 
export const ADD_TO_CIRCLE_BUTTON_COLORS = ['#0000bd', '#1D6EBA'] //#1a65ea
export const BUTTON_COLORS = ['#001689', '#0154e8'] //3b7bed
export const BUTTON_COLORS_REVERSE = ['#0154e8', '#001689'] //3b7bed
export const SUCCESS_COLORS = ["#5DD95D", "#1BFA1B"]
export const APP_STATUS_BAR_COLOR = 'transparent'
export const APP_TEXT_COLOR = '#ffffff'
export const APP_BUTTON_TEXT_COLOR = '#ffffff'
export const APP_BUTTON_COLOR = '#41c572'////"#8dd7c3",//green
export const APP_FLOAT_BUTTON_COLOR = '#41c572'////"#8dd7c3",//green
export const APP_PLACEHOLDER_TEXT_COLOR =  "#CECCCC"
export const APP_NATIVE_NAV_BAR_COLOR = '#2b32b2'
export const APP_HOME_SCREEN_BUTTON_TEXT_COLOR = '#1488cc'
export const APP_HOW_IT_WORKS_COLOR = '#f8f8f8'
export const APP_LOADING_COLOR = '#F4B71A'
export const APP_SUCCESS_COLOR = "#00C497"
export const LIGHT_ICON_COLOR = "#ffffff"
export const TEXT_COLOR_FOR_DARK_BACKGROUND = "#ffffff"
export const TEXT_COLOR_FOR_LIGHT_BACKGROUND = "#000000"
export const SUBTEXT_COLOR_FOR_LIGHT_BACKGROUND = "#8f8f8f"
export const BRAND_BACKGROUND_COLOR = "#001689"
export const BLUE_COLOR = "#0000bd"
export const BACKGROUND_WHITE_COLOR = "#ffffff"
export const BACKGROUND_GREY_COLOR = "#f2f2f2"
export const SUCCESS_COLOR = "#5DD95D"
export const ADD_TO_CIRCLE_ICON_COLOR = "#004CFF"
export const BROADCAST_ICON_COLOR = "#FDCB3c"
export const ACCESS_REQUEST_ICON_COLOR = "#d22d16"
export const CONNECTIONS_ICON_COLOR = "#3fa6dd"
export const IMAGE_DEFAULT_BKGD_COLOR = "#f3f3f3"
export const ERROR_TEXT_COLOR = "#ff506b"
export const CARDS_COLORS = [
    ["#EE0979", "#FF6a00"],
    ['#0000B0', '#AF2BED'],
    ['#8E0E00', '#1f1c18'],
    ['#ff00cc', '#333399'],
    ['#00BF8F', '#001510'],
    ['#C02425', '#F0cb35'],
    ['#000428', '#004e92'],
    ['#061161', '#780206'],
]

export const RESOURCE_PATH_PREFIX = '../assets/resources/'
export const CARD_TEMPLATE_NAMES = [
    require('../assets/resources/Card1.png'),
    require('../assets/resources/Card2.png'),
    require('../assets/resources/Card3.png'),
    require('../assets/resources/Card4.png'),
    require('../assets/resources/Card5.png'),
    require('../assets/resources/Card6.png'),
    require('../assets/resources/Card7.png'),
    require('../assets/resources/Card8.png'),
    require('../assets/resources/Card9.png'),
    require('../assets/resources/Card11.png'),
    require('../assets/resources/Card12.png'),
    require('../assets/resources/Card13.png'),
    require('../assets/resources/Card14.png'),
    require('../assets/resources/Card15.png'),
    require('../assets/resources/Card16.png'),
]
export const DEFAULT_GRADIENT = ["#ffffff", "#ffffff"]
export const INITIAL_SCREEN_TEXT_INPUT_COLOR = "#1242AF"
export const INPUT_BACKGROUND_GRADIENT = ["#1242AF", "#1242AF"]

// Colors for the Floating Button
export const SIGN_OUT_COLOR = '#F44336'

export const APP_TITLE_FONT = "Montserrat-Bold"
export const APP_SUBTITLE_FONT = "Montserrat-Regular"
export const APP_BODY_FONT = "Montserrat-Light"
export const APP_THIN_FONT = "Montserrat-Thin"
export const ICON_CHECKMARK = "ios-checkmark-circle"
export const ICON_BACK_BUTTON = "chevron-left"

// APIs
export const PROFILE_API = "/user/profile";
export const UPDATE_UPI_API = "/user/updateUPI";
export const REQUEST_DETAILS_API = "/request/info?requestId=";
export const SEND_AUTH_CODE_API = "/auth/sendAuthCode";
export const VERIFY_AUTH_CODE_API = "/auth/verifyAuthCode";
export const VIRGIL_JWT_API = "/user/getVirgilJWT"


// Screen parameters
export const VISIT_TYPE = "visitType"
export const VISIT_TYPE_FIRST = "first"
export const VISIT_TYPE_REPEAT = "repeat"
export const LOGIN_AFTER_VERIFY = "login"
export const SIGNUP_AFTER_VERIFY = "signup"

// Request Note
export const ADD_NOTE_ICON = "plus-circle"
export const SAVED_NOTE_ICON = "check-circle"
export const FLIGHT_DOMAINS = ["makemytrip", "ixigo", "cleartrip", "goibibo", "paytm.com/flights", "flipkart.com/travel/flights", "happyeasygo"]
export const MOVIE_DOMAINS = ["bookmyshow", "paytm.com/movies"]

// constraints
export const INVALID_NAMES_LOWERCASE = ['test', 'abc', 'abcd', 'abcde', 'abcdef', 'asdf', 'name']
export const START_INDEX_OTP = 0

// UI components
export const SMALL_BANNER_HEIGHT = "38%"
export const LARGE_BANNER_HEIGHT = "50%"
export const SMALL_ARCH_SCREEN_HEIGHT = "60%"
export const LARGE_ARCH_SCREEN_HEIGHT = "72%"
export const BOTTOM_MENU_HEIGHT = 60
export const EXTRA_SMALL_BANNER_HEIGHT = "30%"
export const EXTRA_LARGE_ARCH_SCREEN_HEIGHT = "80%"

// Friend requests
export const FRIEND_REQUEST_ACTIVE = 0
export const FRIEND_REQUEST_ACTIVE_ICON = "ellipsis-h"
export const FRIEND_REQUEST_DECLINED = -1
export const FRIEND_REQUEST_DECLINED_ICON = "minus"
export const FRIEND_REQUEST_ACCEPTED = 1
export const FRIEND_REQUEST_ACCEPTED_ICON = "check"
export const FRIEND_REQUEST_ACCEPTED_COLOR = "green"
export const FRIEND_REQUEST_DECLINED_COLOR = "red"
export const FRIEND_REQUEST_ACTIVE_COLOR = "#F4B71A"

// Event Handlers
export const MESSAGE_RECEIVED_EVENT = "received"
export const MESSAGE_SUCCESS_STATUS_CODE = 0
export const MESSAGE_TIMEOUT_STATUS_CODE = 15

// Notification
export const ACCESS_REQUEST_NOTIFICATION_TYPE = "ar"
export const FRIEND_REQUEST_NOTIFICATION_TYPE = "fr"

// Access Requests
export const ACCESS_REQUEST_CANCELLED_CODE = -1
export const ACCESS_REQUEST_UNACCEPTED_CODE = 0
export const ACCESS_REQUEST_ACCEPTED_CODE = 1
export const ACCESS_REQUEST_FULFILLED_CODE = 2
export const ACCESS_REQUEST_REJECTED_CODE = 3
export const ACCESS_REQUEST_VALIDATED_CODE = 4
export const ACCESS_REQUEST_INVALIDATED_CODE = 5
export const ACCESS_REQUEST_EXPIRED_CODE = 6
export const ACCESS_REQUEST_EXPIRED_ICON = "clock"
export const ACCESS_REQUEST_EXPIRED_ICON_COLOR = "black"

// Encryption
export const IDENTITY_ALREADY_EXISTS_ERROR = "IdentityAlreadyExistsError"

// Icons
export const CARD_REQUEST_ICON_NAME = "unlock"
export const CARD_REQUEST_ICON_TYPE = "FontAwesome"

// Posts
export const POST_NOTIFICATION_TYPE = "post"